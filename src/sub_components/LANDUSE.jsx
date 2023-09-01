import React, { useState, useEffect,useMemo } from "react";
import * as THREE from "three";
import { Html } from '@react-three/drei';
import { useThree,useFrame } from '@react-three/fiber';

import '../Popup.css'; 
import  config from './LANDUSE_config.json'  ;
import osmconfig from './osm_config.json';
import pako from 'pako';

// distance calculator (x,z no Y)
function distanceToPoint(pointA, pointB) {
    const dx = pointA[0] - pointB[0];
    
    const dz = pointA[2] - pointB[2];
    return Math.sqrt(dx * dx+ dz * dz);
  }

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

export default function LANDUSE(props) {
    const [jsonData, setJsonData] = useState(null);
    const [watertabledata, setWaterData] = useState(null);
    const [objectHash, setHASH] = useState({});
    const [objectWaterHash, setWaterHASH] = useState({});
    
    const [hoveredStates, setHoveredStates] = useState({}); // State to track hovered state for each mesh
    const [clickedStates, setClickedStates] = useState({}); // State to track hovered state for each mesh
    const [activePopup, setActivePopup] = useState(null); // Track the active popup
    const [clickPosition, setClickPosition] = useState([0, 0, 0]); // State to store click position
    const [nearestObjects, setNearestObjects] = useState([]); // State to store the nearest objects
    const [sorted_chunks, setSortedChunks]=useState({});
    const [num_chunks, setNumChunks]=useState(props.chunknumber);
    const { camera } = useThree();
    const [camera_pos,setCameraPos]=useState([100000,0,0])


  const handlePopupClose = () => {
    setActivePopup(null);
  };


  const handlePointerClick = React.useCallback((event,index) => {
    event.stopPropagation();

    console.log("Click", index)

    console.log(event)
    setClickedStates({})
    if (clickedStates[index]){
      setClickedStates((prevState) => ({ ...prevState, [index]: false }));
      setActivePopup(null);
    }
    else{
 
      const boundingBox = new THREE.Box3().setFromObject(event.object);
      const midPosition = new THREE.Vector3();
      boundingBox.getCenter(midPosition);

      console.log(boundingBox)
      setClickPosition(midPosition.toArray());
      setClickedStates((prevState) => ({ ...prevState, [index]: true }));
      setActivePopup(index);
    }
  },[]);

  
  useEffect(() => {
    async function fetchJsonData() {
      try {
        const response = await fetch("/LANDUSE.json.gz"); // Adjust the path if necessary
        const compressedData = await response.arrayBuffer();
        const decompressedData = pako.inflate(compressedData, { to: 'string' });

        // Parse the JSON string to get the original JSON object
        const jsonData = JSON.parse(decompressedData);
 
        setJsonData(jsonData)

        const response2=await fetch("/water_table.json")
        const data2 = await response2.json();
        setWaterData(JSON.parse(data2));
      } catch (error) {
        console.error("Error fetching JSON data:", error);
      }
    }
    fetchJsonData();
  }, []);

  useEffect(() => {
    if (jsonData !== null && jsonData !== undefined) {
      const object_hash={};

      let overall_count=0
      for (let count = 0; count < jsonData.features.length ; count++) {
          let a_feature=jsonData.features[count]
                
      
           
            let coordinates=[]
            let holes=[]
            const holeShapes = [];
            if (a_feature.geometry.type==="Polygon"){
                coordinates = a_feature.geometry.coordinates[0];
            }
            else{
                coordinates =a_feature.geometry.coordinates[0][0];
                if (a_feature.geometry.coordinates[0].length>1){
                    for (let hole_count=1; hole_count<a_feature.geometry.coordinates[0].length; hole_count++){
                        let hole_coords=a_feature.geometry.coordinates[0][hole_count]
                        holes.push(hole_coords)
                    }
                    
                }
            }

            if (coordinates.length >= 3) {
            const points = coordinates.map(coord => new THREE.Vector2(
                +(coord[0] - 130866.75771637209).toFixed(2),
                -(coord[1] - 226171.43460926865).toFixed(2)
            ));

            const shape = new THREE.Shape(points);
          
            if (holes.length>0){
            
                
                for (var i=0; i<holes.length; i++){
              
                    let hole_points=holes[i].map(coord => new THREE.Vector2(
                        +(coord[0] - 130866.75771637209).toFixed(2),
                        -(coord[1] - 226171.43460926865).toFixed(2)
                    )
                    )
                    const holeShape=new THREE.Shape(hole_points)
                    holeShapes.push(holeShape);
                }

                
                
            }
            shape.holes = holeShapes;

            const extrudeSettings = {
                depth: -config[a_feature.properties.LEVEL_2_VALUE]['height'],
                bevelEnabled: false,
                
            };
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            geometry.rotateX(Math.PI / 2);


            const material = new THREE.MeshStandardMaterial({ color: config[a_feature.properties.LEVEL_2_VALUE]['color'] , side: THREE.DoubleSide, transparent:true, opacity:1 });
            const solidMesh = new THREE.Mesh(geometry, material);

            // Create wireframe


            // Group both solid and wireframe meshes
        
            solidMesh.userData=a_feature.properties
            solidMesh.name=a_feature.properties.LEVEL_2_VALUE+"_"+overall_count
            const boundingBox = new THREE.Box3().setFromObject(solidMesh);
            solidMesh.boundingBox = boundingBox;
            overall_count++
            object_hash[solidMesh.name]=solidMesh
        }
      
    }
    
    setHASH(object_hash)

      return () => {
        // Dispose of materials and geometries when component unmounts
        
      };
    }
  }, [jsonData]);

  useEffect(() => {
    if (watertabledata !== null && watertabledata !== undefined) {
      const object_hash={};
      console.log(watertabledata)
      let overall_count=0
      for (let count = 0; count < watertabledata.features.length ; count++) {
          let a_feature=watertabledata.features[count]
                
      
           
            let coordinates=[]
            let holes=[]
            const holeShapes = [];
            if (a_feature.geometry.type==="Polygon"){
                if (a_feature.geometry.coordinates.length>1){
                    coordinates = a_feature.geometry.coordinates[0];
                
                    for (let hole_count=1; hole_count<a_feature.geometry.coordinates.length; hole_count++){
                        let hole_coords=a_feature.geometry.coordinates[hole_count]
                        holes.push(hole_coords)
                    }
                    
                }

                else{
                coordinates = a_feature.geometry.coordinates[0];
                }
            }

            if (coordinates.length >= 3) {
            const points = coordinates.map(coord => new THREE.Vector2(
                +(coord[0] - 130866.75771637209).toFixed(2),
                -(coord[1] - 226171.43460926865).toFixed(2)
            ));

            const shape = new THREE.Shape(points);
          
            if (holes.length>0){
            
                
                for (var i=0; i<holes.length; i++){
              
                    let hole_points=holes[i].map(coord => new THREE.Vector2(
                        +(coord[0] - 130866.75771637209).toFixed(2),
                        -(coord[1] - 226171.43460926865).toFixed(2)
                    )
                    )
                    const holeShape=new THREE.Shape(hole_points)
                    holeShapes.push(holeShape);
                }

                
                
            }
            shape.holes = holeShapes;

            const extrudeSettings = {
                depth: -0.2,
                bevelEnabled: false,
                
            };
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            geometry.rotateX(Math.PI / 2);


            const material = new THREE.MeshStandardMaterial({ color: osmconfig["WATER"]['color'] , side: THREE.DoubleSide, transparent:true, opacity:1 });
            const solidMesh = new THREE.Mesh(geometry, material);

            // Create wireframe


            // Group both solid and wireframe meshes
        
            solidMesh.userData=a_feature.properties
            solidMesh.name="WATER"+"_"+overall_count
            const boundingBox = new THREE.Box3().setFromObject(solidMesh);
            solidMesh.boundingBox = boundingBox;
            overall_count++
            object_hash[solidMesh.name]=solidMesh
        }
      
    }
    
    setWaterHASH(object_hash)

      return () => {
        // Dispose of materials and geometries when component unmounts
        
      };
    }
  }, [watertabledata]);


  const boundingBoxes = useMemo(() => { // setup a bounding box for each object
    console.log('bounding box ')
    return Object.keys(objectHash).reduce((acc, index) => {
      
      
      const mesh = objectHash[index];
     
        
        const boundingBox = mesh.geometry.boundingBox;
        const minPosition = boundingBox.min;
        const maxPosition = boundingBox.max;
        const midPosition = minPosition.clone().add(maxPosition).multiplyScalar(0.5);
        acc[index] = {
          midPosition: midPosition.toArray(),
        };
      
      return acc;
    }, {});
  }, [objectWaterHash]);

   
  const boundingBoxeschunks = useMemo(() => {

    return Object.keys(objectWaterHash).reduce((acc, index) => { // setup bounding boxes for water table objects

      const mesh = objectWaterHash[index];
        
        const boundingBox = mesh.geometry.boundingBox;
        const minPosition = boundingBox.min;
        const maxPosition = boundingBox.max;
        const midPosition = minPosition.clone().add(maxPosition).multiplyScalar(0.5);
        acc[index] = {
          midPosition: midPosition.toArray(),
        };
      
      return acc;
    }, {});
  }, [objectWaterHash]);

  // presort objects to their nearest chunks
  useEffect(() => {
    const sorted_objects = {};

    Object.keys(boundingBoxes).forEach((nodeName) => {
      const nodePosition = boundingBoxes[nodeName].midPosition;
      let nearestChunk = null;
      let nearestChunkPos=null
      let minDistance = Infinity;
  
      Object.keys(boundingBoxeschunks).forEach((chunkName) => {
        const chunkPosition = boundingBoxeschunks[chunkName].midPosition;
        const distance = distanceToPoint(nodePosition, chunkPosition);
  
        if (distance < minDistance) {
          nearestChunk = chunkName;
          nearestChunkPos=chunkPosition
          minDistance = distance;
        }
      });
  
      if (nearestChunk) {
        if (!sorted_objects[nearestChunk]) {
          sorted_objects[nearestChunk] = {
            nodes:[],
            midPoint:nearestChunkPos
          };

        }
        sorted_objects[nearestChunk]['nodes'].push(objectHash[nodeName]);

      }
    });
    setSortedChunks(sorted_objects)
    console.log(sorted_objects)
    console.log("sorted")
    setCameraPos([100000,1000,1000])

  
  },[objectWaterHash])

  useFrame(() => {
    const cameraPosition = camera.position.clone();
    const lookAtVector = new THREE.Vector3();
    camera.getWorldDirection(lookAtVector).normalize();
    const distanceForward=400
    // Calculate the intersection point with y=0 plane
    const intersectionPoint = cameraPosition.clone().addScaledVector(lookAtVector, (cameraPosition.y / -lookAtVector.y)+distanceForward);
    const update_pos=intersectionPoint.toArray()
   
    if (distanceToPoint(update_pos,camera_pos)>50){
      
        
            setCameraPos(update_pos)
        
        
        updateNearestObjects(update_pos);
        setNumChunks(props.chunknumber)
    }
  }, []);

  

  
  function updateNearestObjects(camera_pos) {
    const distancesToCamera = Object.keys(sorted_chunks)
      .map((chunkName) => {
        const { midPosition } = boundingBoxeschunks[chunkName];
     
        return {
          chunkName,
          distance: distanceToPoint(camera_pos, midPosition),
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, num_chunks);  // Limit to the first 10 chunks
    // Set the nearest chunks state

    const nearestChunkObjects = [];
    for (const item of distancesToCamera) {
      const chunkNodes = sorted_chunks[item.chunkName].nodes;
      for (const itemx of chunkNodes){
        nearestChunkObjects[itemx.name]=itemx
      }
    }
 
    setNearestObjects(nearestChunkObjects);
  }


  return (
    Object.keys(nearestObjects).map((nodeName) => (
       
        <group  >
          <mesh 
          
          geometry={objectHash[nodeName].geometry} 
          position={objectHash[nodeName].geometry.position}
          
          material={
            clickedStates[nodeName]
                ? new THREE.MeshStandardMaterial({ color: "red", side: THREE.DoubleSide})
                : objectHash[nodeName].material
              }
              onClick={(event) =>  handlePointerClick(event,nodeName)}
           
          >
          {clickedStates[nodeName] && activePopup === nodeName &&  <Popup position={clickPosition} // Pass the position of the clicked mesh to the Popup component
              data={objectHash[nodeName].userData}
              onClose={handlePopupClose} />}
      
          </mesh>
        </group>
      ))
  );
}
