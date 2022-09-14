
require( [
    'esri/Map',
    'esri/layers/ElevationLayer',
    'esri/views/SceneView',
    'esri/layers/FeatureLayer',
    "esri/core/watchUtils",

], function ( Map,
    ElevationLayer,
    SceneView,
    FeatureLayer,
    watchUtils ) {

    let _map;
    let _view;

    setMap();
    setView();

    function setMap() {
        _map = new Map( {
            basemap: 'gray',
            ground: 'world-elevation'
        } );
        const elevationLayer = new ElevationLayer( {
            url: 'https://dssmappor.ncdr.nat.gov.tw/server/rest/services/NCDR_Basemap/MOI_W84_TPKMDEM_2018/ImageServer'
        } );
        _map.ground.layers.add( elevationLayer );

    }

    function setView() {
        _view = new SceneView( {
            map: _map,
            container: viewDiv,
            center: [121.480087, 25.036869],
            zoom: 18,
            qualityProfile: 'high',
        } );
    }

    const renderer = {
        type: "unique-value",
        defaultSymbol: getSymbol( "#FFFFFF" ),
        defaultLabel: "Other",
        field: "classify",
        uniqueValueInfos: [
            {
                value: "0",
                symbol: getSymbol( "#A7C636" ),
                label: "0"
            },
            {
                value: "1",
                symbol: getSymbol( "#FC921F" ),
                label: "1"
            },
            {
                value: "2",
                symbol: getSymbol( "#ED5151" ),
                label: "2"
            },
        ],
        visualVariables: [
            {
                type: "size",
                field: "z"
            }
        ]

    };

    function getSymbol( color ) {
        return {
            type: "polygon-3d",
            symbolLayers: [
                {
                    type: "extrude",
                    material: {
                        color: color
                    },
                }
            ]
        };
    }

    watchUtils.whenFalse( _view, 'stationary', () => {
        console.log( 'move' );
        _map.removeAll();
    } );

    watchUtils.whenTrue( _view, 'stationary', () => {
        console.log( 'stop' );
        const buildingLayer = new FeatureLayer( {
            url: "https://richimap2.richitech.com.tw/arcgis/rest/services/test/NCDR_SDE_Building_NTP/MapServer/0",
            renderer: renderer,
            popupEnabled: true,
            popupTemplate: {
                outFields: ["BUILD_ID", "z", "classify"],
                content: [
                    {
                        type: "fields",
                        fieldInfos: [
                            {
                                fieldName: "z",
                                label: "Z"
                            },
                            {
                                fieldName: "BUILD_ID",
                                label: "BUILD ID",
                            }, {
                                fieldName: "classify",
                                label: "Classify"
                            },
                        ]
                    }
                ]
            }
        } );
        _map.add( buildingLayer );
    } );

} );