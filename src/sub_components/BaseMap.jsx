import React from "react";
import {  useLoader} from "@react-three/fiber";
import * as THREE from "three"
export function Image() {
    const texture = useLoader(THREE.TextureLoader, "./galway.png")
    return (
      <mesh rotation={[-Math.PI / 2,0,-1.7*Math.PI/360]} scale={[1.055 ,1.055,1.055]} position={[-279,-1,-222 ]}  >
        <planeGeometry attach="geometry" args={[16383,9984]} />
            
        <meshBasicMaterial attach="material" map={texture} />
        
      </mesh>
    )
  }