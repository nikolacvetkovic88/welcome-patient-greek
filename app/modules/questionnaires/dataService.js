app.factory('questionnairesRepository', function($http, $q, helper) {
    var QuestionnairesRepository = {},
        staticQuestionnairesUrl = 'app/modules/questionnaires/staticQuestionnaires.json';

    QuestionnairesRepository.getStaticQuestionnaires =  function() {
        return $http( {
                method: 'GET',
                url: staticQuestionnairesUrl
            });
    }

    QuestionnairesRepository.getQuestionnaires = function(patientId, queryParams, token) {
        var url =  helper.baseUrl + '/Patient/' + patientId + '/QuestionnaireOrder';       
        if(queryParams)
            url += queryParams;
       
        return helper.getCloudData(url, token);
    }

    QuestionnairesRepository.decodeQuestionnaires = function(data, patientId) {
        var subject = "https://cloud-welcome-project.eu/api/data/Patient/" + patientId + "/QuestionnaireOrder";
        var predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
        var parser = N3.Parser();
        var N3Util = N3.Util;
        var questionnaireRefs = [];
        var defer = $q.defer();

        parser.parse(data, function(error, triple) {
            if(triple) {
                if (triple && triple.subject === subject && triple.predicate != predicate) {
                    questionnaireRefs.push(triple.object);
                } 
            } else if (error) {
                console.log(error);
            } else {
                defer.resolve(questionnaireRefs);
            }
        });
        
        return defer.promise;
    }

    QuestionnairesRepository.getQuestionnaireByRef = function(url, token) {
        return helper.getCloudData(url, token);
    }

    QuestionnairesRepository.decodeQuestionnaire = function(data) {
        var parser = N3.Parser({ format: 'application/turtle' });
        var N3Util = N3.Util;
        var questionnaireObj = {};
        var dates = [];
        var stringValues = [];
        var numbers = [];
        var defer = $q.defer();

        parser.parse(data,
            function (error, triple) {
                if (triple) {

                    if(N3Util.isIRI(triple.subject) && triple.subject.indexOf('QuestionnaireOrder') != -1) {
                        var cloudRefArray = triple.subject.split('/');
                        questionnaireObj.cloudRef = cloudRefArray[cloudRefArray.length-1];
                    }

                    if(N3Util.isBlank(triple.object) && N3Util.isBlank(triple.subject) &&
                        (triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.start" ||
                        triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.end")) {

                        if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.start") {
                            questionnaireObj.periodStart = getItemPerSubject(dates, triple.object);
                            return;
                        }

                        if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.end") {
                            questionnaireObj.periodEnd = getItemPerSubject(dates, triple.object);
                            return;
                        }
                    }

                    if(N3Util.isBlank(triple.object) && triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.event") {
                        if(questionnaireObj.timingEvents == null || questionnaireObj.timingEvents.length == 0) {
                            questionnaireObj.timingEvents = [];
                        }

                        questionnaireObj.timingEvents.push(getItemPerSubject(dates, triple.object));
                        return;
                    }

                    if(N3Util.isBlank(triple.object) && N3Util.isBlank(triple.subject) &&
                        (triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.durationUnits" ||
                        triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.periodUnits")) {

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.durationUnits") {
                            questionnaireObj.durationUnit = getItemPerSubject(stringValues, triple.object);
                            return;
                        }

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.periodUnits") {
                            questionnaireObj.periodUnit = getItemPerSubject(stringValues, triple.object);
                            return;
                        }
                    }

                    if(N3Util.isBlank(triple.object) && N3Util.isBlank(triple.subject) &&
                        (triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.duration" ||
                        triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.frequency" ||
                        triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.period")) {

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.duration") {
                            questionnaireObj.duration = getItemPerSubject(numbers, triple.object);
                            return;
                        }

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.frequency") {
                            questionnaireObj.frequency = getItemPerSubject(numbers, triple.object);
                            return;
                        }

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.period") {
                            questionnaireObj.period = getItemPerSubject(numbers, triple.object);
                            return;
                        }
                    }

                    if (N3Util.isBlank(triple.subject) && triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value" &&
                        N3Util.isLiteral(triple.object) && (N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#date" ||
                        N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#dateTime")) {

                        dates.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                    }

                    if(N3Util.isIRI(triple.object) && triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#detail") {
                        questionnaireObj.id =  triple.object.split('#')[1]; // this is used to merge static questionnaires that display the data to the user
                        questionnaireObj.questionnaire = triple.object.split('#')[1].split('_')[1];                        
                        return;
                    }


                    if (N3Util.isBlank(triple.subject) && triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value" &&
                        N3Util.isLiteral(triple.object) && (N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#integer" ||
                        N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#int")) {

                        numbers.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                    }

                    if (N3Util.isBlank(triple.subject) &&
                        triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value" &&
                        N3Util.isLiteral(triple.object) && (N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#date" ||
                        N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#dateTime")) {

                        dates.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                    }

                    if (N3Util.isBlank(triple.subject) &&
                        triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value" &&
                        N3Util.isLiteral(triple.object) && (N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#string")) {

                        stringValues.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                    }
                } else if(error){
                    console.log(error);
                } else {
                    defer.resolve(questionnaireObj);
                }
            });

        return defer.promise;
    }
 
    QuestionnairesRepository.postQuestion = function(questionId, questionType, answer, token) {
        var regBody =   questionType != "free-choice" ?
                        '@prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \
                        @prefix ns2:   <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#> . \
                        @prefix ns1:   <welkv2://welcome-project.eu/data/QuestionAnswer/> . \
                        @prefix ns3:   <http://lomi.med.auth.gr/ontologies/WELCOME_entities#> . \
                        \
                        ns2:QuestionAnswer_1 a ns2:QuestionAnswer ; \
                        <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#QuestionAnswer.value> ns3:' + answer + '; \
                        ns2:question ns2:' + questionId + '.' :

                        '@prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \
                        @prefix ns2:   <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#> . \
                        @prefix ns1:   <welkv2://welcome-project.eu/data/QuestionAnswer/> . \
                        @prefix ns3:   <http://lomi.med.auth.gr/ontologies/WELCOME_entities#> . \
                        @prefix ns7:   <http://lomi.med.auth.gr/ontologies/FHIRPrimitiveTypes#>. \
                        @prefix xsd:   <http://www.w3.org/2001/XMLSchema#>. \
                        \
                        ns2:QuestionAnswer_1 a ns2:QuestionAnswer ; \
                        <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#QuestionAnswer.value> [ \
                        rdf:value"' + answer + '"^^xsd:string; \
                        ]; ns2:question ns2:' + questionId + '.';

        var url = helper.baseUrl + '/QuestionAnswer';

        return helper.postCloudData(url, regBody, token);        
    }

    QuestionnairesRepository.postQuestionGroup = function(questionGroupId, score, questionAnswers, token) {
        var regBody =  '@prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\
                        @prefix xsd:   <http://www.w3.org/2001/XMLSchema#> .\
                        @prefix FHIRct:   <http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#> .\
                        @prefix FHIRpt:   <http://lomi.med.auth.gr/ontologies/FHIRPrimitiveTypes#> .\
                        @prefix FHIRResources:   <http://lomi.med.auth.gr/ontologies/FHIRResources#> .\
                        @prefix FHIRResourcesExtensions: <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#> .\
                        @prefix WELCOME_entities: <http://lomi.med.auth.gr/ontologies/WELCOME_entities#> .\
                        \
                        []\
                          rdf:type FHIRResourcesExtensions:QuestionsGroupAnswers ;\
                          <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#QuestionsGroupAnswers.score> [\
                              rdf:type FHIRpt:decimal ;\
                              rdf:value "' + score + '"^^xsd:decimal ;\
                            ] ;';
  
        angular.forEach(questionAnswers, function(questionAnswer) {
            regBody = regBody + 'FHIRResourcesExtensions:questionAnswer <' + questionAnswer + '>;'
        });
        regBody = regBody + 'FHIRResourcesExtensions:questionsGroup WELCOME_entities:' + questionGroupId + ';.';

        var url = helper.baseUrl + '/QuestionsGroupAnswers';
        
        return helper.postCloudData(url, regBody, token);
    }

    QuestionnairesRepository.postQuestionnaire = function(patientId, questionnaireId, score, questionGroupAnswers, token) {
        var regBody =   '@prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\
                        @prefix xsd:   <http://www.w3.org/2001/XMLSchema#> .\
                        @prefix FHIRct:   <http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#> .\
                        @prefix FHIRpt:   <http://lomi.med.auth.gr/ontologies/FHIRPrimitiveTypes#> .\
                        @prefix FHIRResources:   <http://lomi.med.auth.gr/ontologies/FHIRResources#> .\
                        @prefix FHIRResourcesExtensions: <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#> .\
                        @prefix WELCOME_entities: <http://lomi.med.auth.gr/ontologies/WELCOME_entities#> .\
                        \
                        []\
                          rdf:type FHIRResources:QuestionnaireAnswers ;\
                          <http://lomi.med.auth.gr/ontologies/FHIRResources#QuestionnaireAnswers.authored> [\
                              rdf:type FHIRpt:dateTime ;\
                              rdf:value "' + helper.formatDateTimeForServer(moment()) + '"^^xsd:dateTime ;\
                            ] ;\
                          <http://lomi.med.auth.gr/ontologies/FHIRResources#QuestionnaireAnswers.status> FHIRResources:QuestionnaireAnswersStatus_completed ;\
                          FHIRResources:author <https://cloud-welcome-project.eu/api/data/Patient/' + patientId + '> ;\
                          FHIRResources:questionnaire WELCOME_entities:' + questionnaireId + ' ;\
                          FHIRResources:source <https://cloud-welcome-project.eu/api/data/Patient/' + patientId + '> ;\
                          FHIRResources:subject <https://cloud-welcome-project.eu/api/data/Patient/' + patientId + '> ;\
                          <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#QuestionnaireAnswers.score> [\
                              rdf:type FHIRpt:decimal ;\
                              rdf:value "' + score + '"^^xsd:decimal ;\
                            ] ;';

        angular.forEach(questionGroupAnswers, function(questionGroupAnswer) {
            regBody = regBody +  'FHIRResourcesExtensions:questionsGroupAnswers <' + questionGroupAnswer + '>;';
        });
        regBody = regBody + ".";

        var url = helper.baseUrl + '/QuestionnaireAnswers';

        return helper.postCloudData(url, regBody, token);
    }

    var getItemPerSubject = function(items, searchValue){
        for(var i = 0; i < items.length; i++){
            if(items[i].subject === searchValue) {
                return items[i].value;
            }
        }
    };
     
    return QuestionnairesRepository;
});