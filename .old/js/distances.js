'use strict';

let poly, esSAPTGU, btnActivo, oBtnActivo, tbody, esPTZ, esTLA, esLCE, esSIG, esCOM, divActivo, centroCode, oVehiculos,
    oBaseOrigen, oOrigenDestino, oDestinoBase, directionsService, directionsDisplay;

btnActivo = 'btnDatos';
oBtnActivo = document.getElementById('btnDatos');
divActivo = document.getElementById('datos');

const aBotones = ['btnDatos', 'btnPrecios', 'btnMap', 'btnCostos'];

const opcion = {rndLps: 0, rndUSD: 0, compraUSD: 0, ventaUSD: 0, precioFuel: 0,}

let {rndLps, rndUSD, compraUSD, ventaUSD, precioFuel} = opcion;

const itinerario = {
    vehiculos: [], dias: 0, incentivar: true, nacional: true, kms: {
        extra: 0, total: 0
    }, base: {
        lugar: '', code: '', origen: {
            duracion: 0, distancia: '',
        }, destino: {
            duracion: 0, distancia: '',
        }
    }, origen: {
        lugar: '', code: '', destino: {duracion: 0, distancia: '',}
    }, destino: {
        lugar: '', code: '', base: {duracion: 0, distancia: '',}
    }, costo: {
        comun: 0,
        viaticos: {comida: 0, hotel: 0, incentivo: 0},
        peaje: {salida: 0, sapTGU: 0, sapTLA: 0, ptzSAP: 0},
        frontera: {autentica: 0, extra: 0}
    }
};

let {
    vehiculos, dias, incentivar, nacional, kms, base, origen, destino, costo
} = itinerario,
    {
    viaticos, peaje, frontera
} = costo,
    {
    comida, hotel, incentivo
} = viaticos,
    {
    salida, sapTGU, sapTLA, ptzSAP
} = peaje,
    {
    autentica, extra
} = frontera

const dPrecios    = document.getElementById('precios'),
      dCostos     = document.getElementById('costos'),
      dMap        = document.getElementById('map'),
      dDatos      = document.getElementById('datos'),
      dGastos     = document.getElementById('divGastos'),
      dCotizacion = document.getElementById('cotizacion')

const tabDivs = [dMap, dDatos, dCostos, dCotizacion];

const rootURL = 'http://demo.quotingtours.com';
let apiURL = '';
// TODO: implementar más sets: lugares

let sets = ['parametro', 'tipodevehiculo'];

let oVentaUSD = document.getElementById('tasaUSDv'), oCompraUSD = document.getElementById('tasaUSDc');

sets.forEach((set) => {
    isSiteOnline(rootURL, set)
        .then((rootURL) => {
            apiURL = rootURL + '/api/v1/' + set + '/';
            getSet(set);
        })
        .catch((url) => {
            apiURL = url + set + '.json';
            getSet(set);
        })
});

/**
 * Retrieves and updates the USD exchange rates.
 */
const getRates = function () {
    let usdRates = '/js/tasaUSD.json';
    fetch(usdRates)
        .then(response => response.json())
        .then((tasa) => {
            if (window['tasa_compra_us'] !== undefined) {
                window['tasa_compra_us'].valor = parseFloat(tasa['buyRateUSD']);
                compraUSD = window['tasa_compra_us'].valor;
            }

            if (window['tasa_venta_us'] !== undefined) {
                window['tasa_venta_us'].valor = parseFloat(tasa['saleRateUSD']);
                ventaUSD = window['tasa_venta_us'].valor;
            }

            document.getElementById('tasaUSDc').value = compraUSD;
            document.getElementById('tasaUSDv').value = ventaUSD;
        })
};

/**
 * Retrieves a specific dataset from the API.
 * @param {string} set - The name of the dataset to retrieve ('parametro' or 'tipodevehiculo').
 */
function getSet(set) {
    fetch(apiURL)
        .then((response) => response.json())
        .then((sets) => {
            switch (set) {
                case 'parametro':
                    sets.filter((parametros) => parametros.annio === Math.max(parametros.annio))
                        .forEach((parametro) => {
                            let slug = parametro['slug']
                                .substr(5)
                                .replace(/-/g, '_')

                            window[slug] = new Parametro(parametro['id'], parseInt(parametro['annio']), parametro['nombre'], parseFloat(parametro['valor']), parametro['unidad']);

                        })
                    ventaUSD = window['tasa_venta_us'].valor;
                    compraUSD = window['tasa_compra_us'].valor;
                    precioFuel = window['precio_diesel'].valor;
                    rndLps = window['redondeo_lps'].valor;
                    rndUSD = window['redondeo_us'].valor;

                    oVentaUSD.value = ventaUSD;
                    oCompraUSD.value = compraUSD;

                    document.getElementById('diesel').value = precioFuel;
                    document.getElementById('rndLps').value = rndLps
                    document.getElementById('rndUSD').value = rndUSD;
                    getRates() // TODO: Actualizar tasa $ a fin de mes //
                    break;
                case 'tipodevehiculo':
                    sets
                        .forEach((vehiculo) => {
                            window[vehiculo['slug']
                                .trim()] = new Vehiculo(vehiculo['nombre'], parseFloat(vehiculo['costo_por_dia']), parseFloat(vehiculo['costo_por_km']), parseFloat(vehiculo['rendimiento']), parseFloat(vehiculo['galones_tanque']));
                        })
                    break;
                default:
            }
        })
}

/**
 * Checks if a website is online by trying to load its favicon.
 * @param {string} url - The URL of the website to check.
 * @returns {Promise<string>} - A Promise that resolves with the URL if the site is online, or rejects with a default path if offline.
 */
function isSiteOnline(url) {
    return new Promise((resolve, reject) => {
        let img = document.createElement('img');
        img.src = url + '/favicon.ico';

        img.onerror = () => reject('/js/');
        img.onload = () => resolve(url);
    })
}

/**
 * Displays the map and initializes it.
 */
function displayMap() {
    dMap.style.display = 'block';
    initMap();
}

/**
 * Initializes the Google Map, calculates and displays the route.
 */
function initMap() {
    oBtnActivo.className += ' ui-btn-active';
    let script = document.createElement('script');
    script.src = 'js/v3_epoly.js';
    script.type = 'text/javascript';
    document.getElementsByTagName('head')[0]
        .appendChild(script);

    let markersArray = [];

    incentivar = document.getElementById('incentivo').checked;

    let oBase = document.getElementById('base'), oOrigen = document.getElementById('origen'),
        oDestino = document.getElementById('destino');

    base.lugar = oBase.value;
    origen.lugar = oOrigen.value;
    destino.lugar = oDestino.value;

    oVehiculos = document.getElementById('vehiculo').selectedOptions;
    vehiculos = [];
    if (oVehiculos !== undefined) {
        for (let i = 0; i < oVehiculos.length; i++) {
            vehiculos.push(oVehiculos[i].label.toLowerCase())
        }
    }

    // volver a leer datos de parámetros por si han cambiado
    // precioFuel = document.getElementById('diesel').value;
    // rndLps     = document.getElementById('rndLps').value;
    // rndUSD     = document.getElementById('rndUSD').value;
    // compraUSD  = document.getElementById('tasaUSDc').value;
    // ventaUSD   = document.getElementById('tasaUSDv').value;

    precioFuel = $('#diesel').val();
    rndLps = $('#rndLps').val();
    rndUSD = $('#rndUSD').val();
    compraUSD = $('#tasaUSDc').val();
    ventaUSD = $('#tasaUSDv').val();

    let map = new google.maps
        .Map(document.getElementById('map'), {  // San Pedro Sula
            center: {lat: 15.49, lng: -88.03},
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            optimizeWaypoints: true,
            provideRouteAlternatives: true
        });
    google.maps
        .event
        .trigger(map, 'resize');

    let distanceMatrixService = new google.maps
        .DistanceMatrixService();

    directionsService = new google.maps
        .DirectionsService();
    directionsDisplay = new google.maps
        .DirectionsRenderer({map: map});

    /**
     * Calculates and displays the route on the map.
     * @param {google.maps.DirectionsRenderer} directionsDisplay - The directions renderer object.
     * @param {google.maps.DirectionsService} directionsService - The directions service object.
     * @param {Array<google.maps.Marker>} markersArray - Array to store markers.
     * @param {google.maps.Map} map - The map object.
     */
    function calculateAndDisplayRoute(directionsDisplay, directionsService, markersArray, map) {
        deleteMarkers(markersArray);

        directionsService
            .route({
                origin: origen.lugar, destination: destino.lugar, travelMode: 'DRIVING'
            }, function (response, status) {
                // Route the directions and pass the response to
                // a function to create markers for each step.
                if (status === 'OK') {
                    directionsDisplay
                        .setDirections(response);
                    let routes = response['routes'][0];
                    let legs = routes.legs[0];
                    let path = routes.overview_path;
                    createPoly(path);
                    const mitadRuta = poly.Distance() / 2, puntoMedio = poly.GetPointAtDistance(mitadRuta),
                        pMedLngLat = new google.maps.LatLng(puntoMedio.lat(), puntoMedio.lng()),
                        infoWindow = new google.maps.InfoWindow();

                    const distancia = Math.round(legs.distance.value / 1000).fmtUnits('Kms'),
                        duracion = legs.duration['text'];

                    let info = `<small>Desde (A): <strong>${origen.lugar}</strong>
                                  <br/>Hacia (B): <strong>${destino.lugar}</strong>
                                </small>    
                                <br/>Distancia: <strong>${distancia}</strong>
                                <br/>Duración: <strong>${duracion}'</strong>`;

                    infoWindow.setContent(info);
                    infoWindow.setPosition(pMedLngLat);
                    infoWindow.open(map);
                } else {
                    window.alert(`Google Maps reporta este Error: ${status}`);
                }
            })
    }

    distanceMatrixService
        .getDistanceMatrix({
            origins: [base.lugar, origen.lugar],
            destinations: [base.lugar, destino.lugar],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        }, function (response, status) {
            if (status === google.maps.DistanceMatrixStatus.OK) {
                let originList, destinationList;
                originList = response['originAddresses'];
                destinationList = response['destinationAddresses'];

                deleteMarkers(markersArray);

                // Display the route between the initial start and end selections.
                calculateAndDisplayRoute(directionsDisplay, directionsService, markersArray, /* stepDisplay, */
                    map);
                // Listen to change events from the start and end lists.
                let onChangeHandler = function () {
                    calculateAndDisplayRoute(directionsDisplay, directionsService, markersArray, /* stepDisplay, */
                        map);
                };

                oBase.addEventListener('change', onChangeHandler);
                oOrigen.addEventListener('change', onChangeHandler);
                oDestino.addEventListener('change', onChangeHandler);

                let tramo = response['rows'];

                oBaseOrigen = tramo[1].elements[0];
                oOrigenDestino = tramo[1].elements[1];
                oDestinoBase = tramo[0].elements[1];

                base = {
                    lugar: originList[0], origen: {
                        distancia: Math.round(oBaseOrigen.distance.value / 1000), duracion: oBaseOrigen.duration.text,
                    }
                }
                origen = {
                    lugar: originList[1], destino: {
                        distancia: Math.round(oOrigenDestino.distance.value / 1000),
                        duracion: oOrigenDestino.duration.text,
                    }
                }
                destino = {
                    lugar: destinationList[1], base: {
                        distancia: Math.round(oDestinoBase.distance.value / 1000), duracion: oDestinoBase.duration.text,
                    }
                }

                oBase.value = base.lugar;
                oOrigen.value = origen.lugar;
                oDestino.value = destino.lugar;

                // document.getElementById('diesel').value = precioFuel;
                // document.getElementById('rndLps').value = rndLps;
                // document.getElementById('rndUSD').value = rndUSD;

                $('#diesel').val(precioFuel);
                $('#rndLps').val(rndLps);
                $('#rndUSD').val(rndUSD);

                let oneWay = false; // TODO: Agregar boton

                let oDias = document.getElementById('dias'), oKmsExtra = document.getElementById('sobreKms');

                dias = oDias.value;
                kms.extra = oKmsExtra.value * dias;

                kms.total = oneWay ? base.origen.distancia + origen.destino.distancia + destino.base.distancia : (base.origen.distancia + origen.destino.distancia) * 2;
                kms.total += kms.extra;

                base.code = base.lugar
                    .includes('San Pedro Sula') ? 'SAP' : base.lugar
                    .includes('Tegucigalpa') ? 'TGU' : '';

                nacional = origen.lugar
                    .includes('Honduras') && destino.lugar
                    .includes('Honduras');

                if (base.code === 'SAP') {
                    esSAPTGU = destino.lugar
                        .includes('Tegucigalpa') || destino.lugar
                        .includes('Choluteca') || destino.lugar
                        .includes('San Lorenzo') || destino.lugar
                        .includes('La Paz') || destino.lugar
                        .includes('Marcala') || destino.lugar
                        .includes('Juticalpa') || destino.lugar
                        .includes('Catacamas') || destino.lugar
                        .includes('Zambrano') || destino.lugar
                        .includes('El Paraiso') || destino.lugar
                        .includes('Danli') || destino.lugar
                        .includes('Valle de Angeles') || destino.lugar
                        .includes('Costa Rica') || destino.lugar
                        .includes('Nicaragua') || destino.lugar
                        .includes('Panam');
                } else {
                    if (base.code === 'TGU') {
                        esSAPTGU = origen.lugar
                            .includes('San Pedro Sula') || destino.lugar
                            .includes('San Pedro Sula') || destino.lugar
                            .includes('Guatemala') || destino.lugar
                            .includes('Copan') || destino.lugar
                            .includes('Tela') || destino.lugar
                            .includes('La Ceiba') || destino.lugar
                            .includes('Cortes');
                    }
                }
                esSIG = origen.lugar
                    .includes('Siguatepeque') || destino.lugar
                    .includes('Siguatepeque');
                esCOM = origen.lugar
                    .includes('Comayagua') || destino.lugar
                    .includes('Comayagua');

                centroCode = 'TGU';
                centroCode = esSIG ? 'SIG' : esCOM ? 'COM' : esSAPTGU ? 'TGU' : centroCode;

                esPTZ = origen.lugar
                    .includes('Cortés') || destino.lugar
                    .includes('Cortés');
                esTLA = origen.lugar
                    .includes('Tela') || destino.lugar
                    .includes('Tela') || origen.lugar
                    .includes('Progreso') || destino.lugar
                    .includes('Progreso');
                esLCE = origen.lugar
                    .includes('La Ceiba') || destino.lugar
                    .includes('La Ceiba') || origen.lugar
                    .includes('Sambo') || destino.lugar
                    .includes('Sambo') || origen.lugar
                    .includes('Trujillo') || destino.lugar
                    .includes('Trujillo');

                if (nacional) {
                    incentivo = window['incentivo_hn'].valor;
                    comida = window['alimentacion_hn'].valor * 3;
                    hotel = window['hotel_hn_1'].valor;
                    autentica = 0;
                    extra = 0;
                } else {
                    incentivo = Math.round(window['incentivo_ca'].valor * ventaUSD);
                    comida = Math.round(window['alimentacion_ca'].valor * ventaUSD * 3);
                    hotel = Math.round(window['hotel_ca'].valor * ventaUSD);
                    extra = Math.round(window['gastos_frontera'].valor * ventaUSD);
                    autentica = window['autentica'].valor;
                }

                if (base.code === 'SAP') {
                    sapTGU = esSIG ? window['peaje_sap_yojoa'].valor * 2 : 0;
                    sapTGU = esCOM ? (window['peaje_sap_yojoa'].valor + window['peaje_sap_siguatepeque'].valor) * 2 : sapTGU;
                } else {
                    if (base.code === 'TGU') {
                        sapTGU = esCOM ? window['peaje_sap_zambrano'].valor * 2 : 0;
                        sapTGU = esSIG ? (window['peaje_sap_zambrano'].valor + window['peaje_sap_siguatepeque'].valor) * 2 : sapTGU;
                    }
                }

                if (esSAPTGU) {
                    hotel = window['hotel_hn_3'].valor;
                    sapTGU = (window['peaje_sap_yojoa'].valor + window['peaje_sap_siguatepeque'].valor + window['peaje_sap_zambrano'].valor) * 2;
                    if ((base.code === 'SAP' && origen.lugar
                        .includes('Tegucigalpa')) || (base.code === 'TGU' && origen.lugar
                        .includes('San Pedro Sula'))) {
                        sapTGU = sapTGU * 2;
                    }
                }

                salida = window['peaje_salida_sap'] !== undefined ? window['peaje_salida_sap'].valor : 0;
                ptzSAP = esPTZ && window['peaje_salida_ptz'] !== undefined ? window['peaje_salida_ptz'].valor : 0;
                sapTLA = (esTLA || esLCE) && window['peaje_san_manuel'] !== undefined ? window['peaje_san_manuel'].valor * 2 : 0;

                incentivo = incentivar ? incentivo : 0;

                costo.comun = autentica + extra + comida * dias + incentivo * dias + hotel * (dias - 1) + sapTGU + salida + sapTLA + ptzSAP;

                // *** Imprimir divPrecios ***
                dPrecios.innerHTML = '';

                const stBOrDi = document.createElement('strong'), strBase = document.createElement('strong'),
                    strOrig = document.createElement('strong'), strKmEx = document.createElement('strong');

                stBOrDi.innerHTML = (base.origen.distancia)
                    .fmtUnits('Kms');
                strBase.innerHTML = base.lugar;
                strOrig.innerHTML = origen.lugar;

                const pDesHac = document.createElement('p'), strDest = document.createElement('strong'),
                    stOrDeDi = document.createElement('strong'), stOrDeDu = document.createElement('strong'),
                    emDurac = document.createElement('em'), strKTot = document.createElement('strong'),
                    emDias = document.createElement('em');

                strDest.innerHTML = destino.lugar;
                stOrDeDi.innerHTML = (origen.destino.distancia)
                    .fmtUnits('Kms');
                stOrDeDu.innerHTML = origen.destino.duracion;
                emDurac.innerHTML = `(en `;
                emDurac.appendChild(stOrDeDu);
                emDurac.innerHTML += `)`;
                strKTot.innerHTML = (kms.total)
                    .fmtUnits('Kms.');
                emDias.innerHTML = ` (${dias} Día${(dias > 1 ? 's' : '')})`;
                pDesHac.innerHTML = 'Desde: ';
                pDesHac.appendChild(strOrig);
                pDesHac.innerHTML += ' Hacia: ';
                pDesHac.appendChild(strDest);
                pDesHac.innerHTML += ' son ';
                pDesHac.appendChild(stOrDeDi);
                pDesHac.innerHTML += ', ';
                pDesHac.appendChild(emDurac);

                if (base.lugar !== origen.lugar) {
                    pDesHac.innerHTML += ', más ';
                    pDesHac.appendChild(stBOrDi);
                    pDesHac.innerHTML += ' de la Base: ';
                    pDesHac.appendChild(strBase);
                    pDesHac.innerHTML += ' al Origen: ';
                    pDesHac.appendChild(strOrig);
                }

                pDesHac.innerHTML += ` por vía`;

                if (kms.extra > 0) {
                    pDesHac.innerHTML += ', más ';
                    strKmEx.innerHTML = (kms.extra / dias)
                        .fmtUnits('Kms');
                    pDesHac.appendChild(strKmEx);
                    pDesHac.innerHTML += ` por día de movimientos ${(dias > 1 ? 'internos' : 'extra')}`;
                }
                pDesHac.innerHTML += `. Total `;
                pDesHac.appendChild(strKTot);
                pDesHac.appendChild(emDias);

                addDivRowArr([{
                    concepto: 'ITINERARIO DURACIÓN Y DISTANCIA', clase: 'shade-heda'
                }]);
                addDivRowArr([{
                    concepto: 'Base:', clase: 'top-border'
                }, {
                    concepto: base.lugar
                }]);
                addDivRowArr([{
                    concepto: 'Origen:', clase: 'top-border'
                }, {
                    concepto: origen.lugar, clase: 'str'
                }]);
                addDivRowArr([{
                    concepto: 'Destino:', clase: 'top-border'
                }, {
                    concepto: destino.lugar, clase: 'str'
                }]);
                addDivRowArr([{
                    concepto: 'TRAMO', clase: 'shade'
                }, {
                    concepto: 'Duración'
                }, {
                    concepto: 'Distancia'
                }]);
                if (base.lugar !== origen.lugar) {
                    addDivRowArr([{
                        concepto: 'Base&nbsp;—&nbsp;Origen', clase: 'top-border'
                    }, {
                        concepto: base.origen.duracion
                    }, {
                        concepto: (base.origen.distancia)
                            .fmtUnits('Kms'), clase: 'str'
                    }]);
                }
                addDivRowArr([{
                    concepto: 'Origen&nbsp;—&nbsp;Destino', clase: 'top-border'
                }, {
                    concepto: origen.destino.duracion, clase: 'str'
                }, {
                    concepto: (origen.destino.distancia)
                        .fmtUnits('Kms'), clase: 'str'
                }]);
                if (oneWay) {
                    addDivRowArr([{
                        concepto: 'Destino&nbsp;—&nbsp;Base', clase: 'top-border'
                    }, {
                        concepto: destino.base.duracion
                    }, {
                        concepto: (destino.base.distancia)
                            .fmtUnits('Kms'), clase: 'str'
                    }]);
                }
                if (kms.extra !== 0) {
                    addDivRowArr([{
                        concepto: 'Kms Adicionales', clase: 'shade'
                    }, {
                        concepto: 'por Día'
                    }, {concepto: 'Total'}]);
                    addDivRowArr([{
                        concepto: 'Movimientos Extra', clase: 'top-border'
                    }, {
                        concepto: (kms.extra / dias)
                            .fmtUnits('Kms')
                    }, {
                        concepto: (kms.extra)
                            .fmtUnits('Kms'), clase: 'str'
                    }]);
                }
                addDivRowArr([{
                    concepto: 'Total Itinerario', clase: 'shade-heda'
                }, {
                    concepto: parseFloat(dias)
                        .fmtUnits('Día(s)'), clase: 'str'
                }, {
                    concepto: (kms.total)
                        .fmtUnits('Kms'), clase: 'str'
                }]);

                dPrecios.insertAdjacentElement('beforeend', pDesHac);

// *** Imprmir divGastos ***

                dGastos.innerHTML = '';

                vehiculos
                    .forEach((vehiculo) => {
                        window[vehiculo].calcCostos();
                        renderPrecios(window[vehiculo]);
                        renderCostos(window[vehiculo]);
                    })

                let dentroFuera = nacional ? 'dentro' : 'fuera';
                dPrecios.innerHTML += `<p>El Itinerario es ${dentroFuera} de Honduras</p>`;
            } else {
                alert(`Ocurrió un error con Google Maps: ${status}`);
            }
        });
}

function deleteMarkers(markersArray) {
    if (markersArray !== undefined) {
        for (let i = 0; i < markersArray.length; i++) {
            markersArray[i].setMap(null);
        }
    }
    oBtnActivo.className += ' ui-btn-active';
}

function addDivRowArr(dContent) {
    const row = document.createElement('div');
    row.classList.add('row');
    if (dContent[0].clase !== undefined && dContent[0].clase !== '') row.classList.add(dContent[0].clase);

    dContent
        .forEach((el, i) => {
            let newCol = document.createElement('div');

            newCol.classList.add('col');
            if (i > 0) newCol.classList.add('col-right');

            if (el.hasOwnProperty('clase')) newCol.classList.add(el.clase);

            newCol.innerHTML = el.concepto;

            row.appendChild(newCol);
        })

    dPrecios.appendChild(row);
}

function renderCostos(vehiculo) {
    const {
        modelo, kmsGal, galsTanque, cDiaItinerario, autonomia, cItinerarioLps, galsItinerario, cFuelItinerario
    } = vehiculo;

    let antDieselLps;

    let strDias = `${dias.toString()} día ${((dias > 1) ? 's' : '')}`;

    let table = document.createElement('TABLE');
    table.width = '100%';

    tbody = document.createElement('TBODY');

    addRow('DETALLE DE COSTOS ' + modelo.toUpperCase(), '', 'shade-heda str');

    addRow('COMBUSTIBLE:');
    addRow('Total Distancia Itinerario ', kms.total.fmtUnits('Kms'));
    addRow('Rendimiento ' + modelo, kmsGal.fmtUnits('Km/Gal'));
    addRow('Combustible Total Necesario', Math.round(galsItinerario)
        .fmtUnits('Gals'));
    addRow('Capacidad del Tanque ' + modelo, galsTanque.fmtUnits('Gals', 2));
    addRow('Autonomía ' + modelo, autonomia.fmtUnits('Kms'));

    if ((galsItinerario - galsTanque) >= 0) {
        antDieselLps = Math.round(galsItinerario - galsTanque) * precioFuel;
        addRow('Galones Extra Necesarios', Math.round(galsItinerario - galsTanque)
            .fmtUnits('Gals'));
        addRow('Anticipo para Combustible', antDieselLps.fmtUnits('L'), 'shade');
    } else {
        antDieselLps = 0;
        addRow('No necesita combustible extra', '', '');
    }

    addRow('Total Combustible', cFuelItinerario.fmtUnits('L'), 'shade');

    if (incentivar) {
        addRow('', '', '');
        addRow('Incentivo Chofer (opcional)', (incentivo * dias).fmtUnits('L'), 'shade');
        addRow('', '', '');
    }

    addRow('VIATICOS:');
    addRow('Alimentación ' + (nacional ? 'HN, ' : 'CA, ') + (dias) + ' día' + ((dias > 1) ? 's, ' : ', ') + (nacional ? comida.fmtUnits('L/día') : window['alimentacion_ca'].valor
        .fmtUnits('$/día')), (comida * dias).fmtUnits('L'));
    if (dias > 1) {
        addRow('Hotel ' + (nacional ? 'HN, ' : 'CA, ') + (dias - 1) + ' noche' + ((dias >= 3) ? 's, ' : ', ') + (nacional ? hotel.fmtUnits('L/noche') : window['hotel_ca'].valor
            .fmtUnits('$/noche')), (hotel * (dias - 1)).fmtUnits('L'));
    }
    addRow('Total Viaticos', ((comida * dias) + (hotel * (dias - 1)))
        .fmtUnits('L'), 'shade');

    addRow('PEAJES:');
    if (esSAPTGU || esSIG || esCOM) {
        addRow('Peaje ' + base.code + '-' + centroCode, sapTGU.fmtUnits('L'));
    }
    addRow('Peaje Salida SPS', salida.fmtUnits('L'));
    if (esPTZ) {
        addRow('Peaje Salida Cortes', -ptzSAP.fmtUnits('L'));
    }
    if (esTLA || esLCE) {
        addRow('Peaje San Manuel', sapTLA.fmtUnits('L'));
    }
    addRow('Total Peajes', (sapTGU + salida + ptzSAP + sapTLA)
        .fmtUnits('L'), 'shade');

    if (!nacional) {
        addRow('GASTOS FRONTERA:');
        addRow('Auténtica', autentica.fmtUnits('L'));
        addRow('Anticipo Otros Gastos ' + Math.round((extra) / compraUSD)
            .fmtUnits('$'), Math.round(extra)
            .fmtUnits('L'));
        addRow('Total Gastos Frontera', (autentica + extra)
            .fmtUnits('L'), 'shade');
    }
    addRow('Anticipo Gastos de Viaje')
    addRow('(-) Tanque Lleno ' + modelo, (antDieselLps - cFuelItinerario)
        .fmtUnits('L'));
    if (nacional === false) {
        addRow('(-) Auténtica', (autentica * -1)
            .fmtUnits('L'), '');
    }
    addRow('Total Anticipo Viáticos', (costo.comun + antDieselLps - autentica)
        .fmtUnits('L'), 'shade-heda');
    addRow('Total Gastos ' + modelo, (cFuelItinerario + costo.comun)
        .fmtUnits('L'), 'shade');
    addRow(`(+) Costo Fijo <small>${(vehiculo.costoDia)
        .fmtUnits('L/día')} x ${strDias}</small>`, (vehiculo.cDiaItinerario)
        .fmtUnits('L'));
    addRow(`(+) Costo Variable <small>${((cItinerarioLps - cFuelItinerario - cDiaItinerario - costo.comun) / kms.total)
        .fmtUnits('L/Km', 3)} x ${(kms.total)
        .fmtUnits('Kms')}</small>`, (cItinerarioLps - cFuelItinerario - cDiaItinerario - costo.comun)
        .fmtUnits('L'));
    addRow('Total Costos ' + modelo, cItinerarioLps.fmtUnits('L'), 'shade-heda str');

    addRow(' ', ' ', '');

    // tbody.appendChild(tr);
    table.appendChild(tbody);
    dGastos.appendChild(table);
}

function addRow(concepto, valor, clase) {
    let tr, td;
    if (concepto === undefined) {
        clase = 'shade';
        concepto = ' ';
    }
    tr = document.createElement('TR');
    td = document.createElement('TD');

    td.innerHTML = concepto;
    tr.appendChild(td);

    if (valor === undefined || valor === '') {
        td.colSpan = 2;
        if (clase === undefined) {
            clase = 'shade';
        }
    } else {
        td = document.createElement('TD');

        td.align = 'right';
        td.innerHTML = valor;
        tr.appendChild(td);
    }

    if (clase !== '' && clase !== undefined) {
        tr.className = clase;
    }
    tbody.appendChild(tr);
}

function renderPrecios(vehiculo) {
    const {
        modelo, cItinerarioLps, cItinerarioUSD
    } = vehiculo;

    let concepto, strLps, strUSD, estilo;
    let strDia = '';

    concepto = 'Costo&nbsp;' + modelo;
    strLps = cItinerarioLps.fmtUnits('L');
    strUSD = cItinerarioUSD.fmtUnits('$');
    if (dias > 1) {
        let costoItinUSDdia = (cItinerarioUSD / dias)
            .fmtUnits('$');

        strDia = `<div class="col col-right">
                <strong>
                  ${costoItinUSDdia}<small>/día</small>
                </strong>
              </div>`;
    }

    dPrecios.innerHTML += `<div class="row shade-heda" 
             style="border-top:2px solid #219087; 
                    font-weight: bold; margin-top: 16px;">
        <div class="col">${concepto}</div>
        <div class="col col-right">${strLps}</div>
        <div class="col col-right">${strUSD}</div>${strDia}</div>`;

    for (let i = 30; i >= 10; i = i - 5) {
        concepto = `Precio al ${i}%`;
        strLps = (vehiculo['precioAl' + i])
            .fmtUnits('L');
        strUSD = (vehiculo['precioAl' + i + 'D'])
            .fmtUnits('$');
        strDia = '';

        estilo = (i === 25) ? 'style="background-color: #b5dcef;"' : (i === 15) ? 'style="background-color: #ffb90266;"' : (i === 10) ? 'style="border-bottom:1px solid #216087;"' : '';

        if (dias > 1) {
            let strAliD = (vehiculo['precioAl' + i + 'D'] / dias)
                .fmtUnits('$');

            strDia = `<div class="col col-right">
                    <strong>${strAliD}<small>/día</small></strong>
                 </div>`;
        }
        dPrecios.innerHTML += `<div class="row" ${estilo}>
                <div class="col">${concepto}</div>
                <div class="col col-right">
                    <strong>${strLps}</strong>
                </div>
                <div class="col col-right">
                    <strong>${strUSD}</strong>
                </div>${strDia}
             </div>`;
    }
}

function updParam(parametro) {
    /*
     * TODO: actualizar JSON y API window[parametro] = objeto
     * */
}

function createPoly(path) {
    poly = new google.maps
        .Polyline({
            path: [], strokeColor: '#6ebee4', strokeOpacity: 0.75, strokeWeight: 3
        });
    for (let j = 0; j < path.length; j++) {
        poly.getPath().push(path[j]);
    }
}

Number.prototype.fmtUnits = function (unit, cents, sufix) {
    let sign, number, formatted;
    number = this;
    cents = (cents === undefined || isNaN(cents = Math.abs(cents))) ? 0 : cents;
    sufix = (sufix === undefined && unit !== undefined && (unit.length > 1 || unit === '€')) ? 1 : sufix;
    unit = (unit === undefined) ? '' : `<small>${unit}</small>`;
    sign = number < 0 ? '-' : '';
    number = Math.abs(number);
    if (sufix === undefined) {
        formatted = (unit + '\xa0' + sign + number
            .toFixed(cents)
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'))
            .padStart(12, ' ');
    } else {
        formatted = (sign + number
            .toFixed(cents)
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '\xa0' + unit)
            .padStart(12, ' ');
    }
    if (sign === '-') {
        return `<span style="color:red">${formatted}</span>`
    } else {
        return formatted
    }
}

function Vehiculo(modelo, costoDia, costoKm, kmsGal, galsTanque) {
    this.modelo = modelo;
    this.costoDia = costoDia;
    this.costoKm = costoKm;
    this.kmsGal = kmsGal;
    this.galsTanque = galsTanque;
    this.autonomia = this.kmsGal * this.galsTanque;

    this.calcCostos = function () {
        this.costoKmFuel = Math.round((precioFuel / this.kmsGal) * 1000000) / 1000000;
        this.costoKmOtros = Math.round((this.costoKm - (100 / this.kmsGal)) * 1000000) / 1000000;

        this.galsItinerario = Math.round(kms.total / this.kmsGal);
        this.cFuelItinerario = this.galsItinerario * precioFuel;
        this.cDiaItinerario = Math.round(dias * this.costoDia);
        this.cKmItinerario = Math.round((kms.total * this.costoKmFuel) + (kms.total * this.costoKmOtros));
        this.cItinerarioLps = this.cDiaItinerario + this.cKmItinerario + costo.comun;
        this.cItinerarioUSD = Math.round((this.cItinerarioLps / compraUSD) * 10000) / 10000;

        this.precioAl30 = rndMoney(calcPrecio(this.cItinerarioLps, 30), 'L');
        this.precioAl25 = rndMoney(calcPrecio(this.cItinerarioLps, 25), 'L');
        this.precioAl20 = rndMoney(calcPrecio(this.cItinerarioLps, 20), 'L');
        this.precioAl15 = rndMoney(calcPrecio(this.cItinerarioLps, 15), 'L');
        this.precioAl10 = rndMoney(calcPrecio(this.cItinerarioLps, 10), 'L');
        this.precioAl30D = rndMoney(this.precioAl30, '$');
        this.precioAl25D = rndMoney(this.precioAl25, '$');
        this.precioAl20D = rndMoney(this.precioAl20, '$');
        this.precioAl15D = rndMoney(this.precioAl15, '$');
        this.precioAl10D = rndMoney(this.precioAl10, '$');
        console.log(this.modelo, this.autonomia, this.cFuelItinerario, this.cItinerarioUSD, this.precioAl10D, this.precioAl15D, this.precioAl20D, this.precioAl25D, this.precioAl30D,);
    };
}

function Parametro(id, annio, nombre, valor, unidad) {
    this.id = id;
    this.annio = annio;
    this.nombre = nombre;
    this.valor = valor;
    this.unidad = unidad;
}

function rndMoney(valor, moneda) {
    if (moneda === 'L') {
        return Math.round(valor / rndLps) * rndLps;
    } else {
        if (moneda === '$') {
            return Math.round((valor / ventaUSD) / rndUSD) * rndUSD;
        }
    }
}

function calcPrecio(costo, margen) {
    return costo / (1 - margen / 100);
}

function showTab(btnHref) {
    let divID = btnHref.substr(btnHref.indexOf('#') + 1);

    aBotones
        .forEach(btn => {
            document.getElementById(btn).classList.remove('ui-btn-active');
        })

    divActivo = document.getElementById(divID);

    tabDivs
        .filter((divs) => divs !== divActivo)
        .forEach((div) => {
            div.style.display = 'none';
        })
    divActivo.style.display = 'block';

    if (oVehiculos.length === 0 && (divID === 'costos' || divID === 'cotizacion')) {
        alert('Debes seleccionar al menos un Tipo de Vehículo');
        dMap.style.display = 'none';
        dDatos.style.display = 'block';

        btnActivo = 'btnDatos';
        oBtnActivo = document.getElementById('btnDatos');
        $('#btnMap').removeClass('ui-btn-active');
        $('#btnDatos').addClass('ui-btn-active');
        return
    }
    let tabTitle = document.getElementById('titulo');

    switch (divID) {
        case 'datos':
            btnActivo = 'btnDatos';
            oBtnActivo = document.getElementById('btnDatos');

            tabTitle.innerHTML = 'Requerimientos';
            break;
        case 'costos':
            btnActivo = 'btnCostos';

            tabTitle.innerHTML = 'Costos Operativos';
            break;
        case 'cotizacion':
            btnActivo = 'btnPrecios';

            tabTitle.innerHTML = 'Cotización';
            break;
        case 'map':
            btnActivo = 'btnMap';

            tabTitle.innerHTML = 'Ruta y Distancia';
            break;
        default:
            tabTitle.innerHTML = 'Cotización';

            btnActivo = 'btnDatos';
            break;
    }

    oBtnActivo = document.getElementById(btnActivo);
    oBtnActivo.className += ' ui-btn-active';

}
