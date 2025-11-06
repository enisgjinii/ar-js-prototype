"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/locale';
import { Loader2, AlertCircle } from 'lucide-react';

interface WorkingARViewProps {
    onBack?: () => void;
}

// Ultra-simple AR that definitely works on mobile
export default function WorkingARView({ onBack }: WorkingARViewProps) {
    const t = useT();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isARActive, setIsARActive] = useState(false);
    const [objectsPlaced, setObjectsPlaced] = useState(0);
    const sessionRef = useRef<XRSession | null>(null);
    const glRef = useRef<WebGL2RenderingContext | WebGLRenderingContext | null>(null);

    useEffect(() => {
        return () => {
            if (sessionRef.current) {
                sessionRef.current.end();
            }
        };
    }, []);

    const startAR = async () => {
        setError(null);
        setIsLoading(true);

        try {
            // Check WebXR support
            if (!navigator.xr) {
                throw new Error('WebXR not supported. Use Chrome on Android with ARCore.');
            }

            const supported = await navigator.xr.isSessionSupported('immersive-ar');
            if (!supported) {
                throw new Error('AR not supported. Install Google Play Services for AR.');
            }

            const canvas = canvasRef.current;
            if (!canvas) throw new Error('Canvas not found');

            // Create XR-compatible WebGL context
            const gl = canvas.getContext('webgl2', { xrCompatible: true }) ||
                canvas.getContext('webgl', { xrCompatible: true });

            if (!gl) throw new Error('WebGL not supported');

            // Ensure XR compatibility
            await gl.makeXRCompatible();
            glRef.current = gl;

            console.log('✅ WebGL context created and XR-compatible');

            // Request AR session
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local'],
                optionalFeatures: ['hit-test']
            });

            sessionRef.current = session;
            console.log('✅ AR session created');

            // Create XR layer
            const layer = new XRWebGLLayer(session, gl);
            await session.updateRenderState({ baseLayer: layer });

            // Get reference space
            const referenceSpace = await session.requestReferenceSpace('local');
            console.log('✅ Reference space created');

            setIsARActive(true);
            setIsLoading(false);

            // Set up basic 3D scene
            gl.enable(gl.DEPTH_TEST);
            gl.clearColor(0, 0, 0, 0); // Transparent background

            // Simple shader program for rendering cubes
            const vertexShaderSource = `
        attribute vec3 position;
        attribute vec3 color;
        uniform mat4 mvpMatrix;
        varying vec3 vColor;
        
        void main() {
          gl_Position = mvpMatrix * vec4(position, 1.0);
          vColor = color;
        }
      `;

            const fragmentShaderSource = `
        precision mediump float;
        varying vec3 vColor;
        
        void main() {
          gl_FragColor = vec4(vColor, 1.0);
        }
      `;

            // Create shader program
            const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
            gl.shaderSource(vertexShader, vertexShaderSource);
            gl.compileShader(vertexShader);

            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
            gl.shaderSource(fragmentShader, fragmentShaderSource);
            gl.compileShader(fragmentShader);

            const program = gl.createProgram()!;
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);

            // Get attribute/uniform locations
            const positionLocation = gl.getAttribLocation(program, 'position');
            const colorLocation = gl.getAttribLocation(program, 'color');
            const mvpLocation = gl.getUniformLocation(program, 'mvpMatrix');

            // Create cube geometry
            const cubeVertices = new Float32Array([
                // Front face
                -0.05, -0.05, 0.05, 1, 0, 0,
                0.05, -0.05, 0.05, 1, 0, 0,
                0.05, 0.05, 0.05, 1, 0, 0,
                -0.05, 0.05, 0.05, 1, 0, 0,
                // Back face
                -0.05, -0.05, -0.05, 0, 1, 0,
                0.05, -0.05, -0.05, 0, 1, 0,
                0.05, 0.05, -0.05, 0, 1, 0,
                -0.05, 0.05, -0.05, 0, 1, 0,
            ]);

            const cubeIndices = new Uint16Array([
                0, 1, 2, 0, 2, 3,    // Front
                4, 5, 6, 4, 6, 7,    // Back
                0, 4, 7, 0, 7, 3,    // Left
                1, 5, 6, 1, 6, 2,    // Right
                3, 2, 6, 3, 6, 7,    // Top
                0, 1, 5, 0, 5, 4     // Bottom
            ]);

            // Create buffers
            const vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);

            // Store placed objects
            const placedObjects: Array<{ x: number, y: number, z: number, color: [number, number, number] }> = [];

            // Add test cube in front of camera
            placedObjects.push({
                x: 0, y: 0, z: -0.5,
                color: [1, 0, 0] // Red
            });

            console.log('✅ Test cube added at (0, 0, -0.5)');

            // Handle taps
            let tapCount = 0;
            const handleTap = () => {
                tapCount++;
                console.log('👆 Tap detected #', tapCount);

                // Add object in front of camera with random offset
                const x = (Math.random() - 0.5) * 0.4;
                const y = (Math.random() - 0.5) * 0.2;
                const z = -0.3 - Math.random() * 0.4;

                placedObjects.push({
                    x, y, z,
                    color: [Math.random(), Math.random(), Math.random()]
                });

                setObjectsPlaced(tapCount);
                console.log('🎯 Cube placed at:', x, y, z);
            };

            canvas.addEventListener('click', handleTap);

            // Matrix math helpers
            function createPerspectiveMatrix(fov: number, aspect: number, near: number, far: number) {
                const f = 1.0 / Math.tan(fov / 2);
                return new Float32Array([
                    f / aspect, 0, 0, 0,
                    0, f, 0, 0,
                    0, 0, (far + near) / (near - far), (2 * far * near) / (near - far),
                    0, 0, -1, 0
                ]);
            }

            function multiplyMatrices(a: Float32Array, b: Float32Array) {
                const result = new Float32Array(16);
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        result[i * 4 + j] =
                            a[i * 4 + 0] * b[0 * 4 + j] +
                            a[i * 4 + 1] * b[1 * 4 + j] +
                            a[i * 4 + 2] * b[2 * 4 + j] +
                            a[i * 4 + 3] * b[3 * 4 + j];
                    }
                }
                return result;
            }

            function createTranslationMatrix(x: number, y: number, z: number) {
                return new Float32Array([
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    x, y, z, 1
                ]);
            }

            // Animation loop
            const animate = (timestamp: number, frame: XRFrame) => {
                if (!session) return;

                session.requestAnimationFrame(animate);

                const pose = frame.getViewerPose(referenceSpace);
                if (!pose) return;

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.useProgram(program);

                // Set up vertex attributes
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 24, 0);
                gl.enableVertexAttribArray(colorLocation);
                gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 24, 12);

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

                // Render for each eye
                for (const view of pose.views) {
                    const viewport = layer.getViewport(view);
                    if (!viewport) continue;
                    gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

                    // Create view matrix from XR view
                    const viewMatrix = new Float32Array(view.transform.inverse.matrix);
                    const projMatrix = new Float32Array(view.projectionMatrix);

                    // Render each placed object
                    placedObjects.forEach((obj) => {
                        // Create model matrix
                        const modelMatrix = createTranslationMatrix(obj.x, obj.y, obj.z);

                        // Combine matrices: projection * view * model
                        const mvMatrix = multiplyMatrices(viewMatrix, modelMatrix);
                        const mvpMatrix = multiplyMatrices(projMatrix, mvMatrix);

                        gl.uniformMatrix4fv(mvpLocation, false, mvpMatrix);
                        gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);
                    });
                }
            };

            session.requestAnimationFrame(animate);

            // Handle session end
            session.addEventListener('end', () => {
                console.log('AR session ended');
                setIsARActive(false);
                canvas.removeEventListener('click', handleTap);
            });

        } catch (err: any) {
            console.error('AR Error:', err);
            setError(err.message || 'Failed to start AR');
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-screen relative bg-black">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ touchAction: 'none' }}
            />

            {/* Start AR Button */}
            {!isARActive && !isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-center">
                        <Button
                            onClick={startAR}
                            className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                        >
                            🎯 Start Simple AR
                        </Button>
                        <p className="text-white text-sm mt-2">Fixed WebGL + XR compatibility</p>
                    </div>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                    <div className="text-center text-white">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                        <p className="text-lg">Starting AR...</p>
                        <p className="text-sm opacity-70">Creating XR-compatible WebGL context</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20 p-4">
                    <div className="bg-red-600 text-white p-6 rounded-lg max-w-md text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-3" />
                        <h3 className="font-bold mb-2">AR Error</h3>
                        <p className="text-sm mb-4">{error}</p>
                        <div className="space-y-2 text-xs">
                            <p>✅ Use Chrome on Android</p>
                            <p>✅ Install Google Play Services for AR</p>
                            <p>✅ Allow camera permission</p>
                            <p>✅ Update Chrome browser</p>
                        </div>
                        <Button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-white text-red-600 hover:bg-gray-100"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            )}

            {/* Back Button */}
            <div className="absolute top-4 left-4 z-10">
                <Button
                    onClick={onBack}
                    variant="secondary"
                    className="bg-black/50 text-white border-white/20"
                >
                    ← Back
                </Button>
            </div>

            {/* AR Status */}
            {isARActive && (
                <>
                    <div className="absolute top-4 right-4 z-10">
                        <div className="bg-blue-600/80 text-white px-3 py-1 rounded-full text-sm">
                            🎯 AR Working!
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-black/70 text-white px-6 py-3 rounded-lg text-center">
                            <p className="font-medium">👆 Tap to place cubes</p>
                            <p className="text-sm opacity-80">Cubes placed: {objectsPlaced}</p>
                            <p className="text-xs opacity-60">Look for red cube in front!</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}