import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { Html } from '@react-three/drei';
import '../Popup.css'; 

const Popup = React.memo(({ position, data, onClose }) => {
 

  return (
    <Html position={position}>
      <div className="popup">
        <div className="popuptext show">
          <button className="close-button" onClick={onClose}>
            x
          </button>
          {data ? (
            <table>
              <tbody>
                {Object.keys(data).map((key) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{JSON.stringify(data[key])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No Data available</p>
          )}
        </div>
        <div className="popup-arrow"></div>
      </div>
    </Html>
  );
});

export default function ED(props) {
  const [jsonData, setJsonData] = useState(null);
  const [list_of_objects, setOBJECTS] = useState([]);
  const [clickedStates, setClickedStates] = useState({}); // State to track hovered state for each mesh
  const [activePopup, setActivePopup] = useState(null); // Track the active popup
  const [clickPosition, setClickPosition] = useState([0, 0, 0]); // State to store click position
  const [hoveredStates, setHoveredStates] = useState({}); // State to track hovered state for each mesh
  

  const handlePopupClose = () => {
    setActivePopup(null);
  };
  const handlePointerOver = React.useCallback((index) => {
    setHoveredStates((prevState) => ({ ...prevState, [index]: true }));
  },[]);

  const handlePointerOut = React.useCallback((index) => {  
    setHoveredStates((prevState) => ({ ...prevState, [index]: false }));
  },[]);

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

  
  useEffect(() => {
    async function fetchJsonData() {
      try {
        const response = await fetch("/ED.json"); // Adjust the path if necessary
        const data = await response.json();
        setJsonData(JSON.parse(data)); // No need to parse again
      } catch (error) {
        console.error("Error fetching JSON data:", error);
      }
    }
    fetchJsonData();
  }, []);

  useEffect(() => {
    if (jsonData !== null && jsonData !== undefined) {
      const list_temp_of_objects = [];
      console.log(jsonData)
      for (let count = 0; count < jsonData.features.length ; count++) {
     
      
        let coordinates=[]
        if (jsonData.features[count].geometry.type==="Polygon"){
         coordinates = jsonData.features[count].geometry.coordinates[0];
        }
        else{
           coordinates = jsonData.features[count].geometry.coordinates[0];
        }

        if (coordinates.length >= 3) {
          const points = coordinates.map(coord => new THREE.Vector2(
            +(coord[0] - 130866.75771637209).toFixed(2),
            -(coord[1] - 226171.43460926865).toFixed(2)
          ));

          const shape = new THREE.Shape(points);


          const extrudeSettings = {
            depth: 20,
            bevelEnabled: false,
            
          };
          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          geometry.rotateX(Math.PI / 2);


          const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0x111111, side: THREE.DoubleSide,transparent:true, opacity:0.2 });
          const solidMesh = new THREE.Mesh(geometry, material);
          solidMesh.name=jsonData.features[count].properties.Name

          // Create wireframe


          // Group both solid and wireframe meshes
     
          solidMesh.userData=jsonData.features[count].properties
          list_temp_of_objects.push(solidMesh);
        }
      }
      console.log(list_temp_of_objects)
      setOBJECTS(list_temp_of_objects);

      return () => {
        // Dispose of materials and geometries when component unmounts
        list_temp_of_objects.forEach(object => {
          object.geometry.dispose();
          object.material.dispose();
        });
      };
    }
  }, [jsonData]);

  return (
    list_of_objects.map((object, index) => (
      <group key={index} {...props}>
        <mesh geometry={object.geometry}
          position={[0,50,0]}
          name={object.name}
          material={
            hoveredStates[index]
              ? new THREE.MeshStandardMaterial({ color: "red", side: THREE.FrontSide, transparent:true,  opacity:0.2})
              : object.material
        }
          onClick={(event) =>  handlePointerClick(event,index)}
          onPointerOver={(event) => handlePointerOver(index)}
          onPointerOut={(event) => handlePointerOut(index)}
          >
        {clickedStates[index] && activePopup === index &&  <Popup position={clickPosition} // Pass the position of the clicked mesh to the Popup component
                data={object.userData}
                onClose={handlePopupClose} />}
    
        </mesh>
      </group>
    ))
  );
}
