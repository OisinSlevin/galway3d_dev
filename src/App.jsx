import React, {useRef,useState,useEffect,Suspense}  from "react";
import { Canvas} from "@react-three/fiber";
import {  MapControls, Html} from "@react-three/drei";
import {Model} from "./Scene.jsx";
import Cube from "./Cube.jsx";
import styles from './App.module.css';
import Sparch from "./sub_components/Spanish_arch.jsx"
import Bus from "./sub_components/bus.jsx"
import BusNTA from "./sub_components/bus_nta.jsx"
import ED from "./sub_components/ED.jsx"
import LANDUSE from "./sub_components/LANDUSE.jsx"

import {OSM} from "./sub_components/osm.jsx"
import {Stats}  from "@react-three/drei";
import {Image} from "./sub_components/BaseMap.jsx"
//import Deck from "./sub_components/deck.jsx"
import  DeckGLCanvas  from '@deck.gl/react';
import DeckGL from '@deck.gl/react';
import {LineLayer} from '@deck.gl/layers';
import {Map} from 'react-map-gl';

import StaticMap from "react-map-gl";
import maplibregl from "maplibre-gl";

import "mapbox-gl/dist/mapbox-gl.css";


function Loader() {
  
  return (
    <>
      <Html center>Loading...</Html>
      <ambientLight /> 
      <Cube position={[0, 470, -5]} />
    </>
  );
}

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoib2pzbGV2aW4iLCJhIjoiY2xtNjc1ZW05MGQ5YzNubXRmNjhqMW9kciJ9.i32HJTpCONlRVm603HOuJw';

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -9.037171785811253,
  latitude: 53.28159618564831,
  zoom: 16,
  pitch: 0,
  bearing: 0
};

// Data to be used by the LineLayer


const App = () => {
 
  // Function to add hover props to the child meshes of the Model component
  const cameraRef = useRef();

  const temp_chunknumber = window.innerWidth< 1080 ? 4 : 9;

  const [chunknumber, set_chunks] = useState(temp_chunknumber); 
 
  const [SearchVal, setSearchVal] = useState(""); // State for background color
  const [searchResults, setSearchResults] = useState([{name:null}]); // State to store search results
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [cameraSearchPos,setCameraSearchPos]=useState(null)

  const [showSparch, setShowSparch] = useState(false);
  const [showBus, setShowBus] = useState(false);
  const [showBusNTA, setShowBusNTA] = useState(false);
  const [showED, setShowED] = useState(false);
  const [showLANDUSE, setShowLANDUSE] = useState(false);
  const [showOSM, setShowOSM] = useState(true);
  const [showDef, setShowDef] = useState(false);
  const [showBackground, setShowBackground] = useState(true);
  const [showBasemapImage, setShowBasemap] = useState(true);
  
  const [loading,setLoading]=useState(true)
  const ref=useRef()



  const updateState = (newState) => {
    setLoading(newState);
  };




  // Function to update background color


  const handleMapSizeChange = (selectedOption) => {
    switch (selectedOption) {
      case 'phone':
        set_chunks(4);
        break;
      case 'laptop':
        set_chunks(9);
        break;
      case 'desktop':
        set_chunks(16);
        break;
      case 'slow':
          set_chunks(25);
          break;
      default:
        set_chunks(25);
        break;
    }
  };

  const handleSearchChange = (a_val) => {setSearchVal(a_val);};
  
  const handleSearchResult = (searchResult) => {
    // Update the search results state with the received data
    setSearchResults([{name:null}].concat(searchResult));
    console.log("search_result",searchResult)
    setSelectedPosition(0);
    
  };

  const toggleDef = async () => {
    if (!showDef) {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
   
    setShowDef(!showDef);
  };

  const toggleSparch = () => {
    setShowSparch(!showSparch);
  };

  const toggleBasemapImage = () => {
    setShowBasemap(!showBasemapImage);
  };
  
  const toggleBus = () => {
    setShowBus(!showBus);
  };
  const toggleBusNTA = () => {
    setShowBusNTA(!showBusNTA);
  };
  const toggleED = () => {
    setShowED(!showED);
  };
  const toggleLANDUSE = () => {
    if (!showLANDUSE){
      setLoading(true)
      }
    setShowLANDUSE(!showLANDUSE);

  };
  const toggleOSM = () => {
    if (!showOSM){
      setLoading(true)
      }
    setShowOSM(!showOSM);
    
  };
  const toggleBackground = () => {
    setShowBackground(!showBackground);
  };
  

useEffect(() => {
  // This effect will run whenever showDef changes
  // We use it to trigger an immediate re-render
}, [showDef]);



  

  return (
    <div>
     
     <div className={styles.MapBackground}></div>
      {showBackground && (
      <div className={styles.SidebarBackground}></div>
      )}
      {showBackground &&  (
          <div className={styles.uiContainer}>
            {/*Search BAR */}
             <div className={styles.controlGroup}>
              <label>Search:</label>
                  <input 
                  className={styles.searchbar}
                    type="String"
                    value={SearchVal}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                  
                  {searchResults.length > 0 && (
                    <select 
                      onChange={(e) => {
                        if (searchResults[e.target.selectedIndex].name!==null){
                          const selectedResult=searchResults[e.target.selectedIndex]
                          
                          const minPosition = selectedResult.geometry.boundingBox.min;
                          console.log(minPosition)
                          setCameraSearchPos(minPosition)
                        }
                      }} 
                      className={styles.dropdown}>
                        {searchResults.map((result, index) => (
                          <option key={index}>{result.name}</option>
                        ))}
                    </select>
                  )}
            </div>
            
             {/* MAPSIZE */}
            <div className={styles.controlGroup}>
              <label>MapSize:</label>
                <select
                  value={chunknumber === 4 ? 'phone' : chunknumber ===9 ? 'laptop': chunknumber===16 ? 'desktop' : 'slow'}
                  onChange={(e) => handleMapSizeChange(e.target.value)}
                >
                  <option value="phone">Phone</option>
                  <option value="laptop">Laptop</option>
                  <option value="desktop">Desktop</option>
                  <option value="slow">slow</option>
                </select>
            </div>

            {/* LEGEND */}
            <div className={styles.legendContainer}>
              <div>
                  <input
                    type="checkbox"
                    checked={showDef}
                    onChange={toggleDef}
                  />
                  <span>Default Model</span>
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={showSparch}
                    onChange={toggleSparch}
                  />
                  <span>Spanish Arch</span>
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={showBus}
                    onChange={toggleBus}
                  />
                  <span>Bus Eireann Data</span>
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={showBusNTA}
                    onChange={toggleBusNTA}
                  />
                  <span>National Transit Data</span>
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={showED}
                    onChange={toggleED}
                  />
                  <span>Electoral Districts</span>
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={showLANDUSE}
                    onChange={toggleLANDUSE}
                  />
                  <span>LANDUSE</span>
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={showOSM}
                    onChange={toggleOSM}
                  />
                  <span>OSM</span>
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={showBasemapImage}
                    onChange={toggleBasemapImage}
                  />
                  <span>basemap</span>
                </div>
              </div>
          </div>
        )}
        
          
        

          <Canvas   camera={{  fov: 80,near: 10, far:  10000,position: [0, 500, 0]} }
              style={{ position: 'absolute', top: 0, left: 0 }} // Set canvas to position absolute
              gl={{ antialias: true }}
              
          >   
          
         

          {loading && <Loader/>}
          <Suspense fallback={<Loader />}>
            <directionalLight intensity={0.5} decay={2} color="#ffffff" position={[-5,5,10]} rotation={[90, 0, 0]} />
            <ambientLight />
            <MapControls minPolarAngle={0} maxPolarAngle={1} maxDistance={5000}  minDistance={1} /> 
           
            { showOSM && <OSM updateAppState={updateState} cameraRef={cameraRef} chunknumber={chunknumber} searchval={SearchVal} onSearchResult={handleSearchResult} cameraSearchPos={cameraSearchPos}/>}
           
            { showDef &&<Model updateAppState={updateState}  cameraRef={cameraRef} chunknumber={chunknumber} searchval={SearchVal} onSearchResult={handleSearchResult} cameraSearchPos={cameraSearchPos}/>}
             {showSparch && <Sparch />}
            { showBus && <Bus/>}
            { showBusNTA && <BusNTA/>} 
           
            { showLANDUSE && <LANDUSE updateAppState={updateState}  cameraRef={cameraRef}  chunknumber={chunknumber} />}
            { showED && <ED/>}
            <Stats/>

            { showBasemapImage && <Image />}
          </Suspense>
            
                        
            <axesHelper args={[500]}/>
 
        </Canvas>
        
       
        <button className={styles.toggleBackground}
          type="button"
          onClick={toggleBackground}
         >
          <span>Sidebar</span>
        </button>    
    </div>
  );
};

export default App;


