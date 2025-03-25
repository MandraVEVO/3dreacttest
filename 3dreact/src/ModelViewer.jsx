import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';

const ModelViewer = () => {
    const [model, setModel] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef();
    const textureInputRef = useRef();
    const [texture, setTexture] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target.result;
            const loader = file.name.endsWith('.stl') ? new STLLoader() : new OBJLoader();

            try {
                if (file.name.endsWith('.stl')) {
                    const geometry = loader.parse(fileContent);
                    geometry.center();

                    // Escalar el modelo a un tamaño adecuado
                    const boundingBox = new THREE.Box3().setFromObject(new THREE.Mesh(geometry));
                    const size = new THREE.Vector3();
                    boundingBox.getSize(size);
                    const maxDimension = Math.max(size.x, size.y, size.z);
                    const scaleFactor = 10 / maxDimension; // Ajustar este valor según se necesite

                    geometry.scale(scaleFactor, scaleFactor, scaleFactor);

                    const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.5, roughness: 0.1 });
                    const mesh = new THREE.Mesh(geometry, material);
                    setModel(mesh);
                } else if (file.name.endsWith('.obj')) {
                    const object = loader.parse(fileContent);
                    object.position.set(0, 0, 0);

                    // Escalar el modelo a un tamaño adecuado
                    const boundingBox = new THREE.Box3().setFromObject(object);
                    const size = new THREE.Vector3();
                    boundingBox.getSize(size);
                    const maxDimension = Math.max(size.x, size.y, size.z);
                    const scaleFactor = 10 / maxDimension;

                    object.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    // Aplicar textura si está disponible
                    if (texture) {
                        object.traverse((child) => {
                            if (child.isMesh) {
                                child.material.map = texture;
                                child.material.needsUpdate = true;
                            }
                        });
                    }

                    setModel(object);
                }
                setError(null);
            } catch (err) {
                setError('Error al cargar el archivo. Asegúrate de que sea un archivo .obj o .stl válido.');
            }
        };

        if (file.name.endsWith('.stl')) {
            reader.readAsArrayBuffer(file);
        } else if (file.name.endsWith('.obj')) {
            reader.readAsText(file);
        }
    };

    const handleTextureChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const loader = new THREE.TextureLoader();
        loader.load(
            URL.createObjectURL(file),
            (loadedTexture) => {
                setTexture(loadedTexture);
                setError(null);
            },
            undefined,
            (err) => {
                setError('Error al cargar la textura. Asegúrate de que sea un archivo .jpg válido.');
            }
        );
    };

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
            <label htmlFor="fileInput" className="mb-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg cursor-pointer">Cargar Modelo</label>
            <input
                id="fileInput"
                type="file"
                accept=".obj,.stl"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
            />
            <label htmlFor="textureInput" className="mb-4 px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg cursor-pointer">Cargar Textura</label>
            <input
                id="textureInput"
                type="file"
                accept=".jpg"
                onChange={handleTextureChange}
                ref={textureInputRef}
                className="hidden"
            />
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <Canvas style={{ width: '80%', height: '80vh', background: '#1e1e1e', borderRadius: '12px' }}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 10]} intensity={0.8} />
                <spotLight position={[0, 10, 10]} angle={0.2} penumbra={1} intensity={1.2} />
                <Environment preset="city" />
                {model && <primitive object={model} />}
                <OrbitControls enableZoom={true} />
            </Canvas>
        </div>
    );
};

export default ModelViewer;
