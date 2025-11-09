'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/locale';
import { X, AlertCircle } from 'lucide-react';

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

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-500">
                    Mobile Device Tips
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm mt-1">
                    <li>Use latest Chrome or Safari on mobile</li>
                    <li>Ensure good lighting on the marker</li>
                    <li>Hold device steady, 1-2 feet from marker</li>
                    <li>Make sure entire marker is visible</li>
                    <li>Check browser permissions for camera</li>
                    <li>Try both Marker and Experimental modes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Troubleshooting</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>If objects don't appear, move closer or farther</li>
                <li>Ensure the marker is flat and not wrinkled</li>
                <li>Try in a well-lit environment without glare</li>
                <li>Restart the AR session using the reset button</li>
                <li>Refresh the page if problems persist</li>
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
