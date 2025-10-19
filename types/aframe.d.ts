export {}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any
      'a-entity': any
      'a-camera': any
      'a-assets': any
      'a-obj-model': any
      'a-gltf-model': any
    }
  }
}
