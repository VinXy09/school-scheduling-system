import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Check, Upload } from 'lucide-react';

const PRESET_AVATARS = [
  { name: 'avatar.png', label: 'Male Classic' },
  { name: 'avatar2.png', label: 'Male Alternate' },
  { name: 'avatar3.png', label: 'Female Classic' },
  { name: 'avatar04.png', label: 'Female Alternate' },
  { name: 'avatar5.png', label: 'Professional Neutral' }
];

const AvatarSelector = ({ avatarType = 'avatar', avatarData = '', gender = '', onChange }) => {
  const [activeTab, setActiveTab] = useState(avatarType === 'image' ? 'upload' : 'presets');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Determine fallback default avatar
  const getFallbackAvatar = () => {
    return gender === 'Female' ? 'avatar3.png' : 'avatar.png';
  };

  const currentAvatarUrl = () => {
    if (avatarType === 'image' && avatarData) {
      return avatarData; // base64 string
    }
    if (avatarType === 'avatar' && avatarData) {
      return `/${avatarData}`;
    }
    return `/${getFallbackAvatar()}`;
  };

  const handleSelectPreset = (presetName) => {
    onChange({
      avatar_type: 'avatar',
      avatar_data: presetName
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    // Check size (limit to 5MB before frontend compression)
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Please select an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result;
      if (base64String) {
        onChange({
          avatar_type: 'image',
          avatar_data: base64String
        });
      }
    };
    reader.onerror = () => {
      alert('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
        <h2 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
          <Camera size={16} className="text-slate-500" /> Professor Profile Photo / Avatar
        </h2>
      </div>

      <div className="p-5 flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Left column: Preview */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 shadow-inner group bg-slate-100 flex items-center justify-center">
            <img
              src={currentAvatarUrl()}
              alt="Avatar Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                // In case base path needs to be relative
                e.target.src = avatarType === 'avatar' && avatarData ? avatarData : getFallbackAvatar();
              }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleUploadClick}>
              <Upload size={20} className="text-white" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Profile Preview</p>
        </div>

        {/* Right column: Options */}
        <div className="flex-1 w-full">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-4">
            <button
              type="button"
              className={`pb-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'presets'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
              onClick={() => {
                setActiveTab('presets');
                // Automatically switch preset selection if empty
                if (avatarType === 'image') {
                  onChange({ avatar_type: 'avatar', avatar_data: getFallbackAvatar() });
                }
              }}
            >
              Preset Avatars
            </button>
            <button
              type="button"
              className={`pb-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'upload'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
              onClick={() => {
                setActiveTab('upload');
                if (avatarType === 'avatar') {
                  onChange({ avatar_type: 'image', avatar_data: '' });
                }
              }}
            >
              Upload Custom Photo
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'presets' ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = avatarType === 'avatar' && avatarData === preset.name;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset.name)}
                      className={`relative p-1.5 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-100 bg-slate-50">
                        <img
                          src={`/${preset.name}`}
                          alt={preset.label}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = preset.name; }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-600 font-medium text-center leading-tight">
                        {preset.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                          <Check size={8} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="w-full">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={handleUploadClick}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  dragActive
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/50'
                }`}
              >
                <div className="p-3 bg-slate-100 rounded-full text-slate-500">
                  <ImageIcon size={24} />
                </div>
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-blue-600 hover:underline">Click to upload</span> or drag and drop
                </div>
                <p className="text-[10px] text-slate-400">PNG, JPG, or WEBP (Max 5MB)</p>
                {avatarType === 'image' && avatarData && (
                  <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <Check size={14} /> Image selected & ready
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;
