import React, {  useState, useEffect  }  from "react";
import  proj4 from 'proj4';
import { useGLTF,Html } from '@react-three/drei';
import '../Popup.css'; 
import * as THREE from 'three'; 
import { MathUtils } from 'three';


const Popup = React.memo(({ position, data, onClose }) => {
  return (
    <Html position={position}>
      <div className="popup">
        <div className="popuptext show">
          <button className="close-button" onClick={onClose}>
            x
          </button>
          {data}
        </div>
        <div className="popup-arrow"></div>
      </div>
    </Html>
  );
});

const routes={
  "3517_51440":"401 Eyre Square - Salthill",
  "3517_51441":"402 Seacrest - Eyre Square - Merlin Park",
  "3517_51442":"404 Eyre Square - Newcastle",
  "3517_51443":"405 Rahoon - Eyre Square - Ballybane",
  "3517_51444":"407 Eyre Square - Bóthar an Chóiste",
  "3517_51445":"409 Eyre Square - Parkmore Ind. Est.",
  "3517_51446":"417 Galway - Corofin Cross - Tuam", 
  "3517_51447":"419 Galway - Clifden",

  "3573_52079":"401 Eyre Square - Salthill",
  "3573_52080":"402 Seacrest - Eyre Square - Merlin Park",
  "3573_52081":"404 Eyre Square - Newcastle",
  "3573_52082":"405,Rahoon - Eyre Square - Ballybane",
  "3573_52083":"407,Eyre Square - Bóthar an Chóiste",
  "3573_52084":"409,Eyre Square - Parkmore Ind. Est",
  "3573_52085":"417,Galway - Corofin Cross - Tuam",
  "3573_52086":"7778020,419,Galway - Clifden",
}



export default function BusNTA(props) {
  const { nodes, materials } = useGLTF('./bus_detail.glb')
  const [clickedStates, setClickedStates] = useState({}); // State to track hovered state for each mesh
  const [activePopup, setActivePopup] = useState(null); // Track the active popup
  const [clickPosition, setClickPosition] = useState([0, 0, 0]); // State to store click position
  const [StoredBusData_NTA, setBusDataNTA] = useState([]); // Store bus data in state
  
  
  const handlePopupClose = () => {
    setActivePopup(null);
  };
  
 
 /* const fetchBusData2 = async () => {
    const response2 = await fetch('http://localhost:3001/fetch-data2');
    const responseBody2 = await response2.json(); // Read the response body as text
    console.log(responseBody2)
  };
  
  useEffect(() => {
    
    
    const fetchDataInterval = setInterval(fetchBusData2, 30000); // 30 seconds
    return () => clearInterval(fetchDataInterval); // Clean up on unmount
  }, []); */

  const fetchBusData3 = async () => {
    try {
        const response2 = await fetch('https://galway-3d-dev.vercel.app/api/server/');
   
        const responseBody2 = await response2.json(); // Read the response body as text
        const list_of_buses =[]
        const new_bus_data =[]
        for (const a_bus in responseBody2.entity){
        
        if (responseBody2.entity[a_bus]['vehicle']['trip']['route_id'] in routes){
            
            list_of_buses.push(responseBody2.entity[a_bus])
            const sourceCRS = 'EPSG:4326';   // WGS 84
            const targetCRS = "+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +a=6377340.189 +rf=299.3249646 +towgs84=482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15 +units=m +no_defs +type=crs" 
    
            // Coordinates in 
            // Coordinates in EPSG:4326 (WGS 84)
            const latitude = responseBody2.entity[a_bus]['vehicle']['position']['latitude'];
            const longitude = responseBody2.entity[a_bus]['vehicle']['position']['longitude'];
    
            // Convert coordinates
            const convertedCoordinates = proj4(sourceCRS, targetCRS, [longitude, latitude]);
    
            // The convertedCoordinates array now contains the x and y values in EPSG:29903
            const x = convertedCoordinates[0]-130866.75 ;
            const y = -(convertedCoordinates[1]-226171.43);
            const bearing=0
            const a_new_bus={
            'x':x,
            'y':y,
            'bearing':bearing,
            'Desc':routes[responseBody2.entity[a_bus]['vehicle']['trip']['route_id']]
            }
            new_bus_data.push(a_new_bus)
    
        }
        }
        console.log(list_of_buses)
        if (new_bus_data.length>0){
            setBusDataNTA(new_bus_data)
        }
    } catch (error) {
    console.error('Error fetching data:', error);
  }
  };
  
  useEffect(() => {
    let fetchDataInterval; // Declare the variable outside the fetchData function
  
    const fetchData = async () => {
      await fetchBusData3(); // Fetch data immediately
      fetchDataInterval = setInterval(fetchBusData3, 30000); // 30 seconds interval
    };
  
    fetchData(); // Call fetchData function immediately
  
    // Clean up the interval when the component unmounts
    return () => clearInterval(fetchDataInterval);
  }, []);
  


  const handlePointerClick = React.useCallback((event,meshName) => {
    event.stopPropagation();

    console.log("Click", meshName)

    console.log(event)
      
    if (clickedStates[meshName]){
      setClickedStates((prevState) => ({ ...prevState, [meshName]: false }));
      setActivePopup(null);
    }
    else{
 
      const boundingBox = new THREE.Box3().setFromObject(event.object);
      const midPosition = new THREE.Vector3();
      boundingBox.getCenter(midPosition);

      console.log(boundingBox)
      setClickPosition(midPosition.toArray());
      setClickedStates((prevState) => ({ ...prevState, [meshName]: true }));
      setActivePopup(meshName);
    }
  },[]);

  
  // rotate the box

  // draw the box
  return (
   
    <group>
      {(StoredBusData_NTA).map((busData, index) => (
    
        <group
          key={index}
          position={[busData.x, 2, busData.y]} // Note: Longitudinal position should be X-axis 
          userData={busData} 
          scale={[0.1,0.1,0.1]}
          rotation={[-Math.PI / 1,MathUtils.degToRad(busData.bearing+270),0]}
          //geometry={nodes['Cube'].geometry}
          // smaterial={materials['Material']} 
          
          onClick={(event) =>  handlePointerClick(event,index)}
          >
        <mesh geometry={nodes.Object_10.geometry} material={materials.material} />
        <mesh geometry={nodes.Object_11.geometry} material={materials.material} />
        <mesh geometry={nodes.Object_12.geometry} material={materials.material_4} />
        <mesh geometry={nodes.Object_13.geometry} material={materials.material_4} />
        <mesh geometry={nodes.Object_14.geometry} material={materials.material_4} />
        <mesh geometry={nodes.Object_15.geometry} material={materials.material_4} />
        <mesh geometry={nodes.Object_16.geometry} material={materials.glass} />
        <mesh geometry={nodes.Object_17.geometry} material={materials.material_7} />
        <mesh geometry={nodes.Object_18.geometry} material={materials.material_7} />
        <mesh geometry={nodes.Object_19.geometry} material={materials.metall} />
        <mesh geometry={nodes.Object_2.geometry} material={materials['1616862037160']} />
        <mesh geometry={nodes.Object_20.geometry} material={materials.metall} />
        <mesh geometry={nodes.Object_21.geometry} material={materials.light} />
        <mesh geometry={nodes.Object_22.geometry} material={materials.rezina} />
        <mesh geometry={nodes.Object_23.geometry} material={materials.rezina} />
        <mesh geometry={nodes.Object_24.geometry} material={materials.seat} />
        <mesh geometry={nodes.Object_25.geometry} material={materials.standard} />
        <mesh geometry={nodes.Object_26.geometry} material={materials.standard} />
        <mesh geometry={nodes.Object_27.geometry} material={materials.standard1} />
        <mesh geometry={nodes.Object_28.geometry} material={materials.standard1} />
        <mesh geometry={nodes.Object_29.geometry} material={materials.standard111} />
        <mesh geometry={nodes.Object_3.geometry} material={materials.glass} />
        <mesh geometry={nodes.Object_30.geometry} material={materials.standard1111} />
        <mesh geometry={nodes.Object_31.geometry} material={materials.standard11111} />
        <mesh geometry={nodes.Object_32.geometry} material={materials.standard11111} />
        <mesh geometry={nodes.Object_33.geometry} material={materials.standard2} />
        <mesh geometry={nodes.Object_34.geometry} material={materials.standard21} />
        <mesh geometry={nodes.Object_35.geometry} material={materials.wood} />
        <mesh geometry={nodes.Object_4.geometry} material={materials.standard11} />
        <mesh geometry={nodes.Object_5.geometry} material={materials.standard11} />
        <mesh geometry={nodes.Object_6.geometry} material={materials.black} />
        <mesh geometry={nodes.Object_7.geometry} material={materials.black} />
        <mesh geometry={nodes.Object_8.geometry} material={materials.chrome} />
        <mesh geometry={nodes.Object_9.geometry} material={materials.chrome} />
   
        {clickedStates[index] && activePopup === index &&  <Popup position={[(busData.x/1000), 2/1000, (busData.y/1000)]} // Pass the position of the clicked mesh to the Popup component
                data={JSON.stringify(busData, null, 2)}
                onClose={handlePopupClose} />}
        </group>
             
          
     
      ))}
    </group>
  );
}



