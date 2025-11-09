/**
 * Model Converter using Three.js
 * Converts GLB to USDZ format
 */

/**
 * Convert GLB to USDZ using Three.js (Server-side)
 */
export async function convertGLBtoUSDZWithThreeJS(glbUrl: string): Promise<Buffer> {
    const THREE = await import('three');
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const { USDZExporter } = await import('three/examples/jsm/exporters/USDZExporter.js');

    try {
        console.log('🔄 Loading GLB file...');

        const response = await fetch(glbUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch GLB: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();

        console.log('📦 Parsing GLB with Three.js...');

        const loader = new GLTFLoader();
        const gltf = await new Promise<any>((resolve, reject) => {
            loader.parse(
                arrayBuffer,
                '',
                (gltf: any) => resolve(gltf),
                (error: any) => reject(error)
            );
        });

        console.log('✨ Converting to USDZ...');

        const exporter = new USDZExporter();
        const usdzArrayBuffer = await exporter.parseAsync(gltf.scene);

        console.log('✅ Conversion complete!');

        return Buffer.from(usdzArrayBuffer);
    } catch (error: any) {
        console.error('❌ Three.js conversion failed:', error);
        throw new Error(`Three.js conversion failed: ${error?.message || 'Unknown error'}`);
    }
}

/**
 * Browser-based conversion using Three.js
 */
export async function convertGLBtoUSDZInBrowser(file: File): Promise<Blob> {
    const THREE = await import('three');
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const { USDZExporter } = await import('three/examples/jsm/exporters/USDZExporter.js');

    try {
        console.log('🔄 Reading file...');

        const arrayBuffer = await file.arrayBuffer();

        console.log('📦 Parsing GLB...');

        const loader = new GLTFLoader();
        const gltf = await new Promise<any>((resolve, reject) => {
            loader.parse(
                arrayBuffer,
                '',
                (gltf: any) => resolve(gltf),
                (error: any) => reject(error)
            );
        });

        console.log('✨ Exporting to USDZ...');

        const exporter = new USDZExporter();
        const usdzArrayBuffer = await exporter.parseAsync(gltf.scene);

        console.log('✅ Conversion complete!');

        return new Blob([usdzArrayBuffer], { type: 'model/vnd.usdz+zip' });
    } catch (error: any) {
        console.error('❌ Browser conversion failed:', error);
        throw new Error(`Browser conversion failed: ${error?.message || 'Unknown error'}`);
    }
}
