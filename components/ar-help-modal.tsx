'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/locale';
import { X } from 'lucide-react';

interface ARHelpModalProps {
  onClose: () => void;
}

export default function ARHelpModal({ onClose }: ARHelpModalProps) {
  const t = useT();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">How to Use AR</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Marker-Based AR</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This AR experience uses marker-based tracking. You'll need to
                print or display the Hiro marker pattern.
              </p>
              <div className="flex justify-center mb-3">
                <img
                  src="/hiro-marker.png"
                  alt="Hiro marker"
                  className="w-48 h-48 object-contain border rounded"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Print this marker or display it on another device
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How to Use</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Print or display the Hiro marker</li>
                <li>Allow camera access when prompted</li>
                <li>Point your camera at the marker</li>
                <li>Watch as 3D objects appear on the marker</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Tips</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Ensure good lighting conditions</li>
                <li>Hold your device steady</li>
                <li>Move closer or farther if objects don't appear</li>
                <li>Avoid shiny or reflective surfaces</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={onClose}>Got It</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
