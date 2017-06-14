app.factory('helper', function($http, $base64) {
	var helper = {};

    helper.baseUrl = "https://cloud-welcome-project.eu/api/data";
    helper.hubUrl = "https://gr-welcome.exodussa.com";

    helper.questionnaireMappings = [
    	{
    		id: "Questionnaire_COPDAssessmentTest",
    		name: "Τεστ Αξιολόγησης για την ΧΑΠ  (CAT)"
    	},
	    {
	    	id: "Questionnaire_DSQ_8",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (8)"
	    },
	    {
	    	id: "Questionnaire_DSQ_1",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (1)"
	    },
	    {
	    	id: "Questionnaire_DSQ_6",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (6)"
	    },
	    {
	    	id: "Questionnaire_Physical_Activities",
	    	name: "φυσικής δραστηριότητας"
	    },
	    {
	    	id: "Questionnaire_SmokingCessation",
	    	name: "Ερωτήσεις σχετικές με τη διακοπή καπνίσματος"
	    },
	    {
	    	id: "Questionnaire_DSQ_16",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (16)"
	    },
	    {
	    	id: "Questionnaire_FatigueSeverityScale",
	    	name: "ερωτηματολόγιο FSS"
	    },
	    {
	    	id: "Questionnaire_DSQ_13",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (13)"
	    },
		{
	    	id: "Questionnaire_DSQ_9",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (9)"
	    },
	    {
	    	id: "Questionnaire_DSQ_11",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (11)"
	    },
	    {
	    	id: "Questionnaire_DSQ_7",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (7)"
	    },
	    {
	    	id: "Questionnaire_DSQ_4",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (4)"
	    },
	    {
	    	id: "Questionnaire_DSQ_2",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (2)"
	    },
	    {
	    	id: "Questionnaire_DSQ_14",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (14)"
	    },
	    {
	    	id: "Questionnaire_DSQ_12",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (12)"
	    },
	    {
	    	id: "Questionnaire_DSQ_5",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (5)"
	    },
	    {
	    	id: "Questionnaire_HospitalAnxietyAndDepressionScale",
	    	name: "ερωτηματολόγιο HADS"
	    },
	    {
	    	id: "Questionnaire_FagerstromToleranceQuestionnaire",
	    	name: "Κλίμακα Fagerstrom για την εξάρτηση από νικοτίνη"
	    },
	    {
	    	id: "Questionnaire_MMRC",
	    	name: "ερωτηματολόγιο mMRC"
	    },
	    {
	    	id: "Questionnaire_DSQ_3",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (3)"
	    },
	    {
	    	id: "Questionnaire_DSQ_10",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (10)"
	    },
	    {
	    	id: "Questionnaire_DSQ_15",
	    	name: "Ερωτήσεις σχετικές με την πάθησή σας (15)"
	    },
	    {
	    	id: "Questionnaire_MalnutritionUniversalScreeningTool",
	    	name: "ερωτηματολόγιο MUST"
	    }
    ];

    helper.deviceMappings = [
    	{
    		id: "",
    		name: "Πίεση αίματος"
    	},
    	{
    		id: "",
    		name: "Βάρος"
    	},
    	{
    		id: "",
    		name: "Σάκχαρο αίματος"
    	},
    	{
    		id: "",
    		name: "Θερμόμετρο"
    	},
    	{
    		id: "",
    		name: "Σπιρόμετρο"
    	},
    	{
    		id: "",
    		name: "Γιλέκο"
    	}
    ];

	helper.getCloudData = function(url, x_token) {
		var encodedCred = $base64.encode('welk' + ':' + 'welk');

	    return $http({
		    url: url,
		    method: 'GET',
		    headers: {
		        'Authorization' : 'Basic ' + encodedCred,
		        'Accept' : 'text/turtle',
		        'Content-Type' : 'text/turtle',
		        'X-Token': x_token
		    }
	    });
	}

	helper.getHubData = function(url, x_token) {
		return $http.get(url, {
            headers: {
                "Authorization": "Bearer" + x_token
            }
       });
	}

	helper.postCloudData = function(url, data, x_token) {
		var encodedCred = $base64.encode('welk' + ':' + 'welk');

		return  $http({
            url: url,
            method: 'POST',
            data: data,
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Accept' : 'text/turtle',
                'Content-Type' : 'text/turtle',
                'X-Token': x_token
            }
        });
	}

	helper.formatDateForUser = function(date) {
	    return moment(date).format("ll");
	}

	helper.formatDateTimeForUser = function(dateTime) {
	    return moment(dateTime).format("ll HH:mm");
	}

	helper.formatDateTimeForUserWithSeconds = function(dateTime) {
		return moment(dateTime).format("ll HH:mm:ss");	
	}

	helper.formatTimeForUser = function(dateTime) {
		return moment(dateTime).format("HH:mm");
	}

	helper.formatDateForServer = function(date) {
		return moment(date).format("YYYY-MM-DD");
	}

	helper.formatDateTimeForServer = function(dateTime) {
		return moment(dateTime).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
	}

	helper.notify = function(message, type) {
		$('#notification').notify({
			message: { text: message },
			type: type
		}).show();
	}

	return helper;
});