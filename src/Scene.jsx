import React, {  useState ,  useMemo, useEffect } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import './Popup.css'; 
import * as THREE from 'three'; 
import { useThree } from '@react-three/fiber';

// distance calculator (x,z no Y)
function distanceToPoint(pointA, pointB) {
  const dx = pointA[0] - pointB[0];
  
  const dz = pointA[2] - pointB[2];
  return Math.sqrt(dx * dx+ dz * dz);
}

// click popup 
const Popup = React.memo(({ position, data, onClose}) => {
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



const materialLookup = {
  // Define the mappings for the mesh names and their corresponding materials
  WATER: 'water',
  wetland: 'grass',
  LAND: 'land',
  b_: 'building',
  bp_: 'building',
  c_: 'building',
  wall: 'wall',
  quarry:'breakwater',
  bus_stop: 'bus',
  streetlamp: 'lamp',
  footway: 'building',
  runway: 'building',
  third: 'road',
  parking: 'road',
  meadow:'grass',
  secondary: 'road',
  primary: 'road',
  motorway: 'road',
  grave_yard: 'grave',
  cemetary: 'grave',
  helipad:'hospital',
  sports: 'grass',
  playground: 'garden',
  hedge:'hedge',
  pitch: 'forest',
  park: 'garden',
  grass:'grass',
  golf:'grass',
  garden:'garden',
  farmland:'grass',
  farmyard:'allotments',
  university: 'school',
  school:'school',
  hospital:'hospital',
  track:'track',
  military:'military',
  police:'police',
  beach: 'beach',
  scrub: 'forest',
  wood: 'forest',
  forest: 'forest',
  allotments: 'allotments',
  breakwater: 'breakwater',
  religious: 'religious',
  industrial: 'commercial',
  commercial:'commercial',
  retail: 'commercial',
  _2:'building',
  _1:'building',
  Cube:'building',
  other: 'building'
  // Add more mappings as needed
};


  
export function Model({  updateAppState,chunknumber, searchval,onSearchResult,cameraSearchPos})   {
  // variable setup
  const { nodes, materials }  =useGLTF('/big_model_no_walls.glb');
  const [hoveredStates, setHoveredStates] = useState({}); // State to track hovered state for each mesh
  const [clickedStates, setClickedStates] = useState({}); // State to track hovered state for each mesh
  const [clickPosition, setClickPosition] = useState([0, 0, 0]); // State to store click position
  const [activePopup, setActivePopup] = useState(null); // Track the active popup
  const [nearestObjects, setNearestObjects] = useState([]); // State to store the nearest objects
  const [sorted_chunks, setSortedChunks]=useState({});
  const [num_chunks, setNumChunks]=useState(chunknumber);
  const { camera } = useThree();
 

  // Memoize the bounding boxes for the meshes
  const boundingBoxes = useMemo(() => {
    console.log('bounding box ')
    return Object.keys(nodes).reduce((acc, nodeName) => {
      
      const meshGroup = nodes[nodeName];
      const mesh = meshGroup.getObjectByName(nodeName);
      if (mesh && mesh.name !== 'Scene') {
        
        const boundingBox = mesh.geometry.boundingBox;
        const minPosition = boundingBox.min;
        const maxPosition = boundingBox.max;
        const midPosition = minPosition.clone().add(maxPosition).multiplyScalar(0.5);
        acc[nodeName] = {
          midPosition: midPosition.toArray(),
        };
      }
      return acc;
    }, {});
  }, [nodes]);

  // filter objects starting with "" 
  function filterObjectByStartingString(obj, startingString) {
    console.log('filter str')
    const filteredObject = {};
    Object.keys(obj).forEach((key) => {
      if (key.startsWith(startingString)) {
        filteredObject[key] = obj[key];
      }
    });
    return filteredObject;
  }

  // pull out watertable objects to use as chunks
  const chunks= useMemo(() => { return filterObjectByStartingString(nodes, 'WATERTABLE')},[])
  const boundingBoxeschunks = useMemo(() => {
    return Object.keys(chunks).reduce((acc, nodeName) => {
      const meshGroup = chunks[nodeName];
      const mesh = meshGroup.getObjectByName(nodeName);
      if (mesh && mesh.name !== 'Scene') {
        
        const boundingBox = mesh.geometry.boundingBox;
        const minPosition = boundingBox.min;
        const maxPosition = boundingBox.max;
        const midPosition = minPosition.clone().add(maxPosition).multiplyScalar(0.5);
        acc[nodeName] = {
          midPosition: midPosition.toArray(),
        };
      }
      return acc;
    }, {});
  }, []);

  // presort objects to their nearest chunks
  useEffect(() => {
    const sorted_objects = {};
    console.log(boundingBoxeschunks)
    console.log(boundingBoxes)
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
        sorted_objects[nearestChunk]['nodes'].push(nodeName);
      }
    });
    setSortedChunks(sorted_objects)
    if (Object.keys(sorted_objects).length>0){
  
        updateAppState(false)
    }
    
    console.log("sorted")
    console.log(sorted_objects)
    console.log(sorted_chunks)
  
  },[])


  // Memoize the result of the material lookup function based on hoveredStates
  const getMaterialByMeshName = useMemo(() => {
   
    return (meshName) => {
      for (const key in materialLookup) {
        if (meshName.includes(key)) {
          return materialLookup[key];
        }
      }
      return materialLookup['other'];
    };
  }, [hoveredStates]);

  useFrame(() => {
    const cameraPosition = camera.position.clone();
    const lookAtVector = new THREE.Vector3();
    camera.getWorldDirection(lookAtVector).normalize();
    const distanceForward=400
    // Calculate the intersection point with y=0 plane
    const intersectionPoint = cameraPosition.clone().addScaledVector(lookAtVector, (cameraPosition.y / -lookAtVector.y)+distanceForward);
    const update_pos=intersectionPoint.toArray()
    updateNearestObjects(update_pos);
    setNumChunks(chunknumber)
  }, []);

  useEffect(() =>{
 
    
      const search_results=[]
      for (const anode in nodes){
          for (const akey in nodes[anode].userData){
            if (nodes[anode].userData[akey]===searchval){
              search_results.push(nodes[anode])
            }
          }
      }
      
      onSearchResult(search_results);
  
  },[searchval])
  

  useEffect(() =>{
    console.log(cameraSearchPos)
    console.log(camera)
    if (cameraSearchPos!==null){
    camera.position.copy(cameraSearchPos)
    camera.lookAt(cameraSearchPos)
    camera.updateProjectionMatrix() 
    console.log("camera update")
    }

  },[cameraSearchPos])
  
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
      .slice(0, num_chunks); // Limit to the first 10 chunks

    // Set the nearest chunks state

    const nearestChunkObjects = [];
    for (const item of distancesToCamera) {
      const chunkNodes = sorted_chunks[item.chunkName].nodes;
     
      for (const itemx of chunkNodes){
        nearestChunkObjects.push(itemx)
      }
    }
      setNearestObjects(nearestChunkObjects);
    
  }

const handlePointerOver = React.useCallback((meshName) => {
  setHoveredStates((prevState) => ({ ...prevState, [meshName]: true }));
},[]);

const handlePointerClick = React.useCallback((event,meshName) => {
  event.stopPropagation();
  console.log(nodes[meshName])
  console.log("Click", meshName)
  console.log(camera)
  console.log(event)
    
  if (clickedStates[meshName]){
    setClickedStates((prevState) => ({ ...prevState, [meshName]: false }));
    setActivePopup(null);
  }
  else{
    const boundingBox = event.object.geometry.boundingBox; // Get the mesh's bounding box
    const minPosition = boundingBox.min;
    const maxPosition = boundingBox.max;
    const midPosition = minPosition.clone().add(maxPosition).multiplyScalar(0.5); // Calculate the midpoint
    setClickPosition(midPosition.toArray());
    setClickedStates((prevState) => ({ ...prevState, [meshName]: true }));
    setActivePopup(meshName);
  }
},[]);

const handlePointerOut = React.useCallback((meshName) => {  
  setHoveredStates((prevState) => ({ ...prevState, [meshName]: false }));
},[]);
const handlePopupClose = () => {
  setActivePopup(null);
};
  
// Update the nearest objects function

return (

  <group  dispose={null}>
     {nearestObjects.map((nodeName) => {
      
      const meshGroup = nodes[nodeName];
        
        if (!meshGroup) return null;
        
      
        return (
          <mesh
            key={nodeName}
            onClick={(event) =>  (nodeName.includes('b_') || nodeName.includes('c_')) &&  handlePointerClick(event,nodeName)}
            onPointerOver={() => (nodeName.includes('b_')  || nodeName.includes('c_')) && handlePointerOver(nodeName)}
            onPointerOut={() => (nodeName.includes('b_') || nodeName.includes('c_')) && handlePointerOut(nodeName)}
            geometry={nodes[nodeName].geometry}
           
            
            material={
              hoveredStates[nodeName]
                ? materials['hospital']
                : materials[getMaterialByMeshName(nodeName)]
            } // Use the currentMaterial for each mesh
            userData={{ name: nodeName }} // You can update the originalPosition if needed
          >
            {clickedStates[nodeName] && activePopup === nodeName &&  <Popup position={clickPosition} // Pass the position of the clicked mesh to the Popup component
            data={nodeName +" \n insert metadata here please"}
            onClose={handlePopupClose}
            />}

          </mesh>
        )
        }
        )
      }     
    </group>
  );
};