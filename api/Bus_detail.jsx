/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.10 ../public/bus_detail.glb 
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/bus_detail.glb')
  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
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
      </group>
    </group>
  )
}

useGLTF.preload('/bus_detail.glb')