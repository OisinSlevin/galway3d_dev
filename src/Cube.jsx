import React from "react";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Cube(props) {
  const mesh = useRef();
  // rotate the box
  useFrame((state, delta) => {
    mesh.current.rotation.x = mesh.current.rotation.y += 0.01;
  });
  // draw the box
  return (
    <mesh {...props} ref={mesh}>
      <boxGeometry args={[4, 4, 4]} />
      <meshNormalMaterial color="#146C94" />
    </mesh>
  );
}
