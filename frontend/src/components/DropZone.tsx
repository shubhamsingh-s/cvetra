'use client';
import React from 'react';
export function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };
  return (
    <div onDrop={onDrop} onDragOver={e => e.preventDefault()}
      className='border-2 border-dashed border-blue-400 rounded-xl
        p-12 text-center cursor-pointer hover:bg-blue-50 transition'>
      <p>Drop resume here or click to browse</p>
      <input type='file' accept='.pdf,.docx'
        onChange={e => e.target.files && onFile(e.target.files[0])} />
    </div>
  );
}
