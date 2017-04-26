app.factory('commentsRepository', function($http, $q, helper) {
    var CommentsRepository = {};

    CommentsRepository.getMessages = function(patientId, queryParams, token) {
        var url =  helper.baseUrl + '/Patient/' + patientId + '/PersonalCommunication';
        if(queryParams)
            url += queryParams;

        return helper.getCloudData(url, token);
    }

    CommentsRepository.decodeMessages = function(data, patientId) {
        var subject = "https://cloud-welcome-project.eu/api/data/Patient/" + patientId + "/PersonalCommunication";
        var predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
        var parser = N3.Parser();
        var N3Util = N3.Util;
        var messageRefs = [];
        var defer = $q.defer();

        parser.parse(data,
            function (error, triple) {
                if (triple) {
                    if(triple && triple.subject === subject && triple.predicate != predicate)
                        messageRefs.push(triple.object);
                } else if(error) {
                    console.log(error);
                } else
                    defer.resolve(messageRefs);
            });

        return defer.promise;
    }

    CommentsRepository.getMessageByRef = function(url, token) {
        return helper.getCloudData(url, token);
    }

    CommentsRepository.decodeMessage = function(data) {
        var parser = N3.Parser({ format: 'application/turtle' });
        var N3Util = N3.Util;
        var messageObj = {};
        var dates = [];
        var defer = $q.defer();

        parser.parse(data,
            function (error, triple) {
                if (triple) {

                    if(N3Util.isBlank(triple.subject) && triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value") {
                        if(N3Util.isLiteral(triple.object) && N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#dateTime") {
                            dates.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                            return;
                        }
                    }

                    if(N3Util.isBlank(triple.object) && N3Util.isIRI(triple.subject) &&
                        (triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRResources#Communication.sent" || triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRResources#Communication.received")) {
                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRResources#Communication.sent" ) {
                            messageObj.dateSent = getItemPerSubject(dates, triple.object);
                            return;
                        }

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRResources#Communication.received" ) {
                            messageObj.dateReceived = getItemPerSubject(dates, triple.object);
                            return;
                        }

                    }

                    if(N3Util.isBlank(triple.subject) && triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value") {
                        if(N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#string") {
                            messageObj.message = N3Util.getLiteralValue(triple.object);
                            return;
                        }
                    }

                    if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#Communication.status") {
                        messageObj.status = triple.object.split('#')[1];
                        return;
                    }

                    if(N3Util.isIRI(triple.object)) {
                        if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#sender") {
                            messageObj.sender= triple.object;
                            return;
                        }

                        if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#recipient") {
                            messageObj.recipient = triple.object;
                            return;
                        }

                        if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#subject") {
                            messageObj.subject = triple.object;
                            return;
                        }
                    }
                } else if(error) {
                    console.log(error);
                } else {
                    defer.resolve(messageObj);
                }
            });

        return defer.promise;
    }

    CommentsRepository.postMessage = function(patientUrl, hcpUrl, message, token) {
        var url =  helper.baseUrl + '/PersonalCommunication';
        var dateSent = helper.formatDateTimeForServer(moment());
        var regBody = '@prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .' +
            '@prefix xsd:   <http://www.w3.org/2001/XMLSchema#> .' +
            '@prefix ns2:   <http://lomi.med.auth.gr/ontologies/FHIRResources#> .' +
            '@prefix ns1:   <http://lomi.med.auth.gr/ontologies/WELCOME_entities#> .' +
            '@prefix ns4:   <http://lomi.med.auth.gr/ontologies/FHIRPrimitiveTypes#> .' +
            '<http://aerospace.med.auth.gr:8080/welcome/api/data/PersonalCommunication/45f7eb43-114b-4ad3-8a78-194ea23d1a2b>' +
            'a                           ns1:PersonalCommunication ;' +
            'ns2:Communication.payload   [ a          ns4:string ;' +
            'rdf:value  "' + message + '"^^xsd:string' +
            '] ;' +
                'ns2:Communication.received  [ a          ns4:dateTime ;' +
                 'rdf:value  "'+ dateSent +'"^^xsd:dateTime' +
                 '] ;' +
            'ns2:Communication.sent      [ a          ns4:dateTime ;' +
            'rdf:value  "'+ dateSent +'"^^xsd:dateTime' +
            '] ;' +
            'ns2:Communication.status    ns2:' + 'CommunicationStatus_in_progress' + ' ;' +
            'ns2:recipient               <'+ hcpUrl +'> ;' +
            'ns2:sender                  <'+ patientUrl +'> ;' +
            'ns2:subject                 <'+ patientUrl +'> .';

        return  helper.postCloudData(url, regBody, token);
    }

    var getItemPerSubject = function(items, searchValue){
        for(var i = 0; i < items.length; i++) {
            if(items[i].subject === searchValue) {
                return items[i].value;
            }
        }
    }

    return CommentsRepository;
});