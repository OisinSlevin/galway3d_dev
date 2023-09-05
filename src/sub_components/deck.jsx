import React from 'react';
import DeckGL from '@deck.gl/react';
import {LineLayer} from '@deck.gl/layers';
import {Map} from 'react-map-gl';

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoib2pzbGV2aW4iLCJhIjoiY2xtNjc1ZW05MGQ5YzNubXRmNjhqMW9kciJ9.i32HJTpCONlRVm603HOuJw';

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
  pitch: 0,
  bearing: 0
};

// Data to be used by the LineLayer
const data = [
  {sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}
];

export default function Deck() {
  const layers = [
    new LineLayer({id: 'line-layer', data})
  ];

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true} >
      <LineLayer id="line-layer" data={data} />
    </DeckGL>
  );
}