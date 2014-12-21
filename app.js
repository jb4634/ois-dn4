
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}
function kreirajEHRzaBolnika() {
	sessionId = getSessionId();

	var ime = $("#kreirajIme").val();
	var priimek = $("#kreirajPriimek").val();
	var datumRojstva = $("#kreirajDatumRojstva").val();

    if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#kreirajSporocilo").html("<span class='label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
    } else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#kreirajSporocilo").html("<span class='obvestilo label label-success fade-in'>Uspešno kreiran EHR '" + ehrId + "'.</span>");
		                    console.log("Uspešno kreiran EHR '" + ehrId + "'.");
		                    $("#preberiEHRid").val(ehrId);
		                }
		            },
		            error: function(err) {
		            	$("#kreirajSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
		            	console.log(JSON.parse(err.responseText).userMessage);
		            }
		        });
		    }
		});
	}
}
function preberiEHRodBolnika() {
	sessionId = getSessionId();

	var ehrId = $("#preberiEHRid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#preberiSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#preberiSporocilo").html("<span class='obvestilo label label-success fade-in'>Ime in priimek '" + party.firstNames + " " + party.lastNames + "', datum in ura rojstva: '" + party.dateOfBirth + "'.</span>");
				console.log("Ime: " + party.firstNames + " " + party.lastNames + ", rojen '" + party.dateOfBirth + ".");
			},
			error: function(err) {
				$("#preberiSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
			}
		});
	}	
}

// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see a blank space instead of the map, this
// is probably because you have denied permission for location sharing.

var map;
var pos;
var infowindow;
var service;

function initialize() {
  var mapOptions = {
    zoom: 13
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      var infowindow = new google.maps.InfoWindow({
        map: map,
        position: pos,
        content: 'Location found using HTML5.'
      });
	

      map.setCenter(pos);

			      
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}


function najdiBliznje(tip){
	        var request = {
			    location: pos,
			    radius:5000,
			    types: ['hospital']
			  };
			  infowindow = new google.maps.InfoWindow();
			  service = new google.maps.places.PlacesService(map);
			  service.nearbySearch(request, callback);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}



google.maps.event.addDomListener(window, 'load', initialize);


function dodajEHR1(){
		$("#preberiEHRid1").val($('#preberiObstojeciEHR1').val());
}
function dodajEHR(){
		$("#preberiEHRid").val($('#preberiObstojeciEHR').val());
}

function preberiMeritveVitalnihZnakov() {
	sessionId = getSessionId();	

	var ehrId = $("#preberiEHRid1").val();
	var tip = $("#preberiTipZaVitalneZnake").val();
	
	$("#dodajVitalnoTelesnaTemperatura").val("Dela");
	

	if (!ehrId || ehrId.trim().length == 0 || !tip || tip.trim().length == 0) {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
		$("#dodajVitalnoTelesnaTemperatura").val("Prazno");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#dodajVitalnoTelesnaTemperatura").val("Ni opozorila");
				$("#rezultati").html("<br/><span style=\"color:#fff\">Pridobivanje podatkov za <b>'" + tip + "'</b> bolnika <b>'" + party.firstNames + " " + party.lastNames + "'</b>.</span><br/><br/>");
				if (tip == "telesna temperatura") {
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "body_temperature",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
					    		var stevecPod=0;
					    		var stevecNad=0;
									for(var i in res){
										if(res[i].temperature<35){
											stevecPod++;	
										}else if(res[i].temperature>37.0){
											stevecNad++;
										}
									}
									if(stevecPod> (2/5)*res.length){
										$("#rezultati").append("<span style=\"font-size:18px;color:#fff\">Temperatura telesa se večkrat spusti pod priporočeno spodnjo mejo 35°.<br>"+
										"<b>Nasvet:</b></br>- zadrževanje v toplih prostorih</br>- topla oblačila<br> Če se stanje ne izboljša je potreben obisk zdravnika.</span>" );
										najdiBliznje('doctor');
									}
									else if(stevecNad> (2/5)*res.length){
										$("#rezultati").append("<span style=\"font-size:18px;color:#fff\">Temperatura telesa se večkrat dvigne priporočeno zgornjo mejo 37°C.<br>"+
										"<b>Nasvet:</b></br>- krepitev imunskega sistema (veliko sadja in zelenjave)<br> Priporočen je takojšen obisk zdravnika.</span>" );
										najdiBliznje('doctor');
									}
									else{
										$("#rezultati").append("<span style=\"font-size:18px;color:#fff\">V večji meri je telesna temperatura v skladu z priporočeno telesno temperaturo</span>");
									}
									
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});
				}
				else if (tip == "indeks telesne mase") {
					$.ajax({
				    url: "https://rest.ehrscape.com/ThinkCDS/services/CDSResources/guide/execute/BMI.Calculation.v.1/" + ehrId,
				    type: 'GET',
				    headers: {
				        "Ehr-Session": sessionId
				    },
				    success: function (data) {
				        var bmiVal = '', bmiDet = '';
				        if (data instanceof Array) {
				            if (data[0].hasOwnProperty('results')) {
				                data[0].results.forEach(function (v, k) {
				                    if (v.archetypeId === 'openEHR-EHR-OBSERVATION.body_mass_index.v1') {
				                        var rounded = Math.round(v.value.magnitude * 100.0) / 100.0;
				                        bmiVal = rounded + ' ' + v.value.units;
				                    }
				                    else{
				                        if(v.archetypeId === 'openEHR-EHR-EVALUATION.gdl_result_details.v1'){
				                            bmiDet = '<span class="bmi-details">' + v.value.value + '</span>';
				                        }
				                    }
				                })
				            }
				        }
				        bmiDet=bmiVal.substring(0,5);
				        if(bmiDet<17.1){
				        	$("#rezultati").append("<span style=\"font-size:18px;color:#fff\">Indeks telesne mase ("+bmiVal+") je nevarno nizek. Potreben obisk zdravnika.</span>")
				        	najdiBliznje('doctor');
				        	
				        }
				        else if(bmiDet>17 && bmiDet<18.5 ){
				        	$("#rezultati").append("<span style=\"font-size:18px;color:#fff\">Indeks telesne mase ("+bmiVal+") je nižji kot je priporočeno.<br><b>Nasvet:"+
				        							"</b></br>- uživane hrane z večjo količino kalorij</br>- bolj pogosto uživanje hrane</span>")
				        }
				        else if(bmiDet>=18.5 && bmiDet<=25.0){
				        		$("#rezultati").append("<span style=\"font-size:18px;color:#fff\">Indeks telesne mase ("+bmiVal+") je v mejah priporočenega indeksa telesne mase.</span>");
				        }
				        else if(bmiDet>25.0 && bmiDet<33.0){
				        		$("#rezultati").append("<span style=\"font-size:18px;color:#fff\">Indeks telesne mase ("+bmiVal+") je višji kot je priporočeno.<br><b>Nasvet:</b>"+
				        					"</br>- uživanje hrane z manj kalorij</br>- več gibanja</br>- obisk fitnesa.</span>");
				        		najdiBliznje('gym');
				        }
				        else{
				        	$("#rezultati").append("<span style=\"font-size:18px;color:#fff\">Indeks telesne mase ("+bmiVal+") je nevarno visok. Potreben je takojšen obisk zdravnika.</span>");
				        	najdiBliznje('doctor');
				        }
				    }
				});
				
				}else if(tip == "kisik"){
					var dolzina=0;
					$.ajax({
				    url: baseUrl + "/view/" + ehrId + "/spO2",
				    type: 'GET',
				    headers: {
				        "Ehr-Session": sessionId
				    },
				    success: function (res) {
				        if(res.length>0){
					        var nadMejo=0;
					        dolzina=res.length;
					        for(var i in res){
					     			if(res[i]<90)nadMejo++;
					        }
					        if(nadMejo>(2/5*res.length)){
					        		$("#rezultati").append("<span style=\"font-size:18px;color:#fff\">Večkrat se pojavlja nižja nasičenost kisika v krvi kot je priporočeno. Potrebno se je posvetovati s specialistom.</span>");
				        			najdiBliznje('hospital');
					        }
					        else $("#rezultati").append("<span style=\"font-size:18px;color:#fff\">Raven kisika v krvi je v skladu s priporočeno vrednostjo.</span>");
				    	}else{
				    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
				    	}
				    }
					});

				} 
				
				else if (tip == "krvni tlak") {
					var avgSis;
					$.ajax({
				    url: baseUrl + "/view/" + ehrId + "/blood_pressure",
				    type: 'GET',
				    headers: {
				        "Ehr-Session": sessionId
				    },
				    success: function (res) {
				        var sistolicni=0;
				        var diastolicni=0;
				        for(var el in res){
				        	sistolicni+=res[el].systolic;
				        }
				        avgSis=sistolicni/res.length;
				    }

					});
					if(avgSis>130){
				    	$("#rezultati").append("<span style=\"font-size:18px;color:#fff\">Podatki kažejo na visok krvni tlak oziroma hipertenzijo"+
				    						"Potrebno se je posvetovati s specialistom.</span>");
				        			najdiBliznje('hospital');
			    }
			    else if(avgSis<100 && avgSis>90){
			    	$("#rezultati").append("<span style=\"font-size:18px;color:#fff\">Povprečen krvni tlak je malenkost nižji kot je priporočeno"+
				    						"<br><b>Nasvet:</b><br>- uživanje bolj slane hrane<br>- uživanje kave<br>- povečana telesna aktivnost</span>");
			    }
			    else if(avgSis<90){
			    	$("#rezultati").append("<span style=\"font-size:18px;color:#fff\">Podatki kažejo na nizek krvni tlak."+
  									"Potrebno se je posvetovati s specialistom.</span>");
      			najdiBliznje('hospital');
			    }
			    else{ $("#rezultati").append("<span style=\"font-size:18px;color:#fff\">Krvni tlak je v mejah priporočene vrednosti.</span")}
					var AQL = 
						"select " +
							"t/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/magnitude as Systolic_magnitude "+
						"from EHR e[e/ehr_id/value='" + ehrId + "'] " +
						"contains OBSERVATION t[openEHR-EHR-OBSERVATION.blood_pressure.v1] " +
						"where t/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/magnitude>100"+
						"order by t/data[at0002]/events[at0003]/time/value desc " +
						"limit 10";
					$.ajax({
					    url: baseUrl + "/query?" + $.param({"aql": AQL}),
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res) {
									var stOdstopanj=0;
					    		var rows = res.resultSet;
						        for (var i in rows) {
						            if(rows[i].Systolic_magnitude-avgSis>20 || rows[i].Systolic_magnitude-avgSis<-20){
						            	stOdstopanj++;
						            }
						        }
						        if(stOdstopanj>dolzina/3)
						        	$("#rezultati").append("<span style=\"font-size:18px;color:#fff\">Pogosto se pojavljajo večja nihanja sistoličnega krvnega tlaka. Priporočen je obisk zdravnika</span>")
					    				najdiBliznje('doctor');
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}

					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});
				}
	    	},
	    	error: function(err) {
	    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
	    	}

		});
	}
}
function dodajMeritveVitalnihZnakov() {
	sessionId = getSessionId();

	var ehrId = $("#preberiEHRid").val();
	var datumInUra = $("#dodajVitalnoDatumInUra").val();
	var telesnaVisina = $("#dodajVitalnoTelesnaVisina").val();
	var telesnaTeza = $("#dodajVitalnoTelesnaTeza").val();
	var telesnaTemperatura = $("#dodajVitalnoTelesnaTemperatura").val();
	var sistolicniKrvniTlak = $("#dodajVitalnoKrvniTlakSistolicni").val();
	var diastolicniKrvniTlak = $("#dodajVitalnoKrvniTlakDiastolicni").val();
	var nasicenostKrviSKisikom = $("#dodajVitalnoNasicenostKrviSKisikom").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Preview Structure: https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datumInUra,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
		    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
		};
		var parametriZahteve = {
		    "ehrId": ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		    	console.log(res.meta.href);
		        $("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
		    },
		    error: function(err) {
		    	$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
		    }
		});
	}
}

function generiraj3(){
		sessionId = getSessionId();
		var ehr1;
		var ehr2;
		var ehr3;
		ehr1=generirajEnega("Alfa","Beta","1993-12-12T03:03");
		ehr2=generirajEnega("Gama","Delta","1985-10-12T03:03");
		ehr3=generirajEnega("Alfa","Beta","1973-10-12T03:03");
	console.log("trije ehr: "+ehr1+" "+ehr2+" "+ehr3);
		
		var datum=["2000-11-12T05:05","2001-09-12T05:05","2001-11-12T05:05","2002-11-12T05:05",
										"2000-11-12T05:05","2001-11-12T05:05","2002-11-12T05:05",
										"2000-11-12T05:05","2002-11-12T05:05","2004-11-12T05:05"];
		var visina=["190","191","191","192",
								"170","172","171",
								"185","185","184"];
		var teza=["80.5","82.3","75.5","80.5",
							"95.5","92.5","93.5",
							"61.4","62.4","61.0"];
		var temperatura=["36.5","38.5","36.2","37.5",
										"37.5","37.5","37.5",
										"34.5","35.2","36.0"];
		var sistolicni=["120","120","120","120",
										"160","150","100",
										"85","90","80"];
		var diastolicni=["120","120","120","120",
										"160","150","100",
										"85","90","80"];
		var kri=["82","83","82","83",
							"95","95","95",
							"82","82","82"];
		var ehr;					
		for(var i=0;i<10;i++){
			ehr=ehr1;
			if(i>3){
				if(i>6)ehr=ehr3;
				else ehr=ehr2
			}
			
			vnesiPodatke(ehr,datum[i],visina[i],teza[i],temperatura[i],sistolicni[i],diastolicni[i],kri[i]);
		}
		console.log("podatki so bili vnešeni za: "+ehr1+" , "+ ehr2+ " , "+ehr3);
		$("#generirajMsg").html("<span class='obvestilo label label-success fade-in'>Uspešno vnešeni '" +ehr1+" , "+ ehr2+ " , "+ehr3);
}
function vnesiPodatke(ehrId,datumInUra,telesnaVisina,telesnaTeza,telesnaTemperatura,
					sistolicniKrvniTlak,diastolicniKrvniTlak, nasicenostKrviSKisikom){
		
		$.ajaxSetup({
	    headers: {"Ehr-Session": sessionId},
		});
		var podatki = {
			// Preview Structure: https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datumInUra,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
		    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
		};
		var parametriZahteve = {
		    "ehrId": ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		};
		$.ajax({
				async:false,
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		    },
		    error: function(err) {
		    	console.log(JSON.parse(err.responseText).userMessage);
		    }
		});
}
function generirajEnega(ime, priimek, datum){
		var ehr;
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
				async:false,
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datum,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		        		async:false,
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
	                   	ehr=ehrId;
	                    console.log("Uspešno kreiran EHR '" + ehrId + "'.");
		                }
		            },
		            error: function(err) {
		            	$("#generirajMsg").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
		            	console.log(JSON.parse(err.responseText).userMessage);
		            }
		        });
		    }
		});
		return ehr;
}