import React, { useState, useEffect,useMemo,startTransition } from "react";
import * as THREE from "three";
import { Html } from '@react-three/drei';
import { useThree,useFrame } from '@react-three/fiber';
import '../Popup.css'; 
import  config from './osm_config.json'  ;
import pako from 'pako';
// distance calculator (x,z no Y)
function distanceToPoint(pointA, pointB) {
    const dx = pointA[0] - pointB[0];
    
    const dz = pointA[2] - pointB[2];
    return Math.sqrt(dx * dx+ dz * dz);
  }

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

const Popup = React.memo(({ position, data, onClose }) => {
    console.log(data)
    const tags = data && data['tags'];
  
    return (
      <Html position={position}>
        <div className="popup">
          <div className="popuptext show">
            <button className="close-button" onClick={onClose}>
              x
            </button>
            {tags ? (
              <table>
                <tbody>
                  {Object.keys(tags).map((key) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{JSON.stringify(tags[key])}</td>
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
  

  

export  function OSM( props) {
  const [jsonData, setJsonData] = useState(null);
  const [objectHash, setHASH] = useState({});
  const [hoveredStates, setHoveredStates] = useState({}); // State to track hovered state for each mesh
  const [clickedStates, setClickedStates] = useState({}); // State to track hovered state for each mesh
  const [activePopup, setActivePopup] = useState(null); // Track the active popup
  const [clickPosition, setClickPosition] = useState([0, 0, 0]); // State to store click position
  const [nearestObjects, setNearestObjects] = useState([]); // State to store the nearest objects
  const [sorted_chunks, setSortedChunks]=useState({});
  const [num_chunks, setNumChunks]=useState(props.chunknumber);
  const { camera } = useThree();
  const [camera_pos,setCameraPos]=useState([100000,0,0])
  const [userData,setUserData]=useState({})
  const HoveredMaterial=new THREE.MeshStandardMaterial({ color: "red", side: THREE.DoubleSide})
  const lookAtVector = new THREE.Vector3();

  const handlePopupClose = () => {
    setActivePopup(null);
  };



  const handlePointerClick = React.useCallback((event,index) => {
    event.stopPropagation();
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

      setClickPosition(midPosition.toArray());
      setClickedStates((prevState) => ({ ...prevState, [index]: true }));
      setActivePopup(index);
    }
  },[]);

  
  useEffect(() => {
    async function fetchJsonData() {
      try {
        const response = await fetch("/openstreetmap.json.gz"); // Adjust the path if necessary
        const compressedData = await response.arrayBuffer();
        const decompressedData = pako.inflate(compressedData, { to: 'string' });
       
        // Parse the JSON string to get the original JSON object
        const jsonData = JSON.parse(decompressedData);
        setJsonData(jsonData);
      } catch (error) {
        console.error("Error fetching JSON data:", error);
      }
    }
    fetchJsonData();
  }, []);


  useEffect(() => {  // convert the json data to mesh data
    if (jsonData !== null && jsonData !== undefined) {
        const object_hash={};
        const temp_user_data={}
     
        let overall_count=0
        for (let object_type_count=0; object_type_count<Object.keys(jsonData).length;object_type_count++){
            const ob_name=Object.keys(jsonData)[object_type_count]
            const feature_col=jsonData[Object.keys(jsonData)[object_type_count]]
      
            for (let count = 0; count < feature_col.features.length ; count++) { 
                let a_feature=feature_col.features[count]
                if (a_feature.geometry===null){
                    //do nothing
                }
                else{
                        
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
                    else if(a_feature.geometry.type==="Point"){
                        coordinates=a_feature.geometry.coordinates
                    }
                    else if(a_feature.geometry.type==="LineString" && config[ob_name]['expected']==="line"){
                        coordinates=a_feature.geometry.coordinates
                    
                    }
                    else{
                        
                        if (ob_name==="LAND" && a_feature['geometry'].type==="MultiPolygon"){
                            console.log(a_feature)
                        }
                        coordinates = a_feature.geometry.coordinates[0];
                        if (a_feature.geometry.coordinates.length>1){
                            for (let hole_count=1; hole_count<a_feature.geometry.coordinates.length; hole_count++){
                                let hole_coords=a_feature.geometry.coordinates[hole_count]
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
                    let height_mult=1
                    if (config[ob_name]['height_field']!==""){
                        if (a_feature.properties['tags'][config[ob_name]['height_field']]!== undefined){
                            height_mult=a_feature.properties['tags'][config[ob_name]['height_field']]/2
                        }
                    }
                
                    const extrudeSettings = {
                        steps: 1,
                        depth: -((config[ob_name]['roof']-config[ob_name]['base'])*height_mult),
                        bevelEnabled: false,
                        
                    };
                    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                    geometry.rotateX(Math.PI / 2);
                    geometry.position= [0,Number(config[ob_name]['base']),0]
            

                    


                    const material = new THREE.MeshStandardMaterial({ color: config[ob_name]['color'] , side: THREE.DoubleSide, transparent:true, opacity:1 });
                    const solidMesh = new THREE.Mesh(geometry, material);
                    const boundingBox = new THREE.Box3().setFromObject(solidMesh);
                    solidMesh.boundingBox = boundingBox;
                    // Create wireframe


                    // Group both solid and wireframe meshes
                    
                  
                    solidMesh.name=ob_name+"_"+overall_count
                    overall_count++
                    object_hash[solidMesh.name]=solidMesh
                    temp_user_data[solidMesh.name]=a_feature.properties

                }
            }
        }
    }
    
      setHASH(object_hash)
      console.log(objectHash)
      setJsonData(null)
      setUserData(temp_user_data)

  
    }
  }, [jsonData]);

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
  }, [objectHash]);

  
  const chunks= useMemo(() => { return filterObjectByStartingString(objectHash, 'WATER')},[objectHash]) //get water table objects
 
  const boundingBoxeschunks = useMemo(() => {
    console.log("bbox_chunks")
    return Object.keys(chunks).reduce((acc, index) => { // setup bounding boxes for water table objects

      const mesh = chunks[index];
        
        const boundingBox = mesh.geometry.boundingBox;
        const minPosition = boundingBox.min;
        const maxPosition = boundingBox.max;
        const midPosition = minPosition.clone().add(maxPosition).multiplyScalar(0.5);
        acc[index] = {
          midPosition: midPosition.toArray(),
        };
      
      return acc;
    }, {});
  }, [objectHash]);

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
          boundingBoxeschunks[nearestChunk]['nodes']=[]
          sorted_objects[nearestChunk] = {
           
            midPoint:nearestChunkPos
          };

        }
        boundingBoxeschunks[nearestChunk]['nodes'].push(objectHash[nodeName]);

      }
    });
    setSortedChunks(sorted_objects)
    
    console.log("sorted")
  
    setCameraPos([100000,1000,1000])

  
  },[objectHash])

  useFrame(() => { // camera update location
    const cameraPosition = camera.position.clone();
    camera.getWorldDirection(lookAtVector).normalize();
    const distanceForward=400
    // Calculate the intersection point with y=0 plane
    const intersectionPoint = cameraPosition.clone().addScaledVector(lookAtVector, (cameraPosition.y / -lookAtVector.y)+distanceForward);
    const update_pos=intersectionPoint.toArray()
   
    

    if (distanceToPoint(update_pos,camera_pos)>100){
        setNumChunks(props.chunknumber)
        updateNearestObjects(update_pos);     
        setCameraPos(update_pos)
    }
    
  }, []);
  
  function updateNearestObjects(camera_pos) { // resort nearest chunks to camera
  
    const distancesToCamera = Object.keys(sorted_chunks)
      .map((chunkName) => {
          const {midPosition}  = boundingBoxeschunks[chunkName];
     
        return {
          chunkName,
          distance: distanceToPoint(camera_pos, midPosition),
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, num_chunks);  // Limit to the first 10 chunks
    // Set the nearest chunks state

    const nearestChunkObjects = [];



    let chunkNodes=[];
    for (const item of distancesToCamera) {
      chunkNodes = boundingBoxeschunks[item.chunkName].nodes;
      for (const itemx of chunkNodes){
        nearestChunkObjects[itemx.name]=itemx
      }
    }
    setNearestObjects(nearestChunkObjects);
    if (Object.keys(nearestChunkObjects).length>0){
        props.updateAppState(false)
    }
  }

  return (

    <group dispose={null} >
    {Object.keys(nearestObjects).map((nodeName) => {

      
        const meshGroup = nearestObjects[nodeName];
        if (!meshGroup) return null ;

        return (
            <mesh 
            key={nodeName}
            geometry={nearestObjects[nodeName].geometry} 
            position={nearestObjects[nodeName].geometry.position}
            material={
                clickedStates[nodeName]
                ? HoveredMaterial
                : nearestObjects[nodeName].material
                }
                onClick={(event) =>  handlePointerClick(event,nodeName)}
            >
            {clickedStates[nodeName] && activePopup === nodeName &&  <Popup position={clickPosition} // Pass the position of the clicked mesh to the Popup component
                data={userData[nodeName]}
                onClose={handlePopupClose} />}
            </mesh>
        )})
    }
    </group>
  );
};
