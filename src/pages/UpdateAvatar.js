import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import BaseURL, { IMAGE_BASE_URL } from '../components/ApiCreds';
import { getToken } from '../utils/functions';
import male1 from "../assets/images/male1.png"
import male2 from "../assets/images/male2.png"
import logo from '../assets/images/logo.png';
import CustomHeader from '../components/CustomHeader';
import { useNavigate } from 'react-router-dom';

const CustomButton = ({ onClick, title, loading, className }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={loading}
      className={`w-full max-w-md rounded-full bg-gray-900 py-3 px-4 text-white font-semibold 
        transition-all duration-200 hover:bg-gray-800
        disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
      ) : (
        title
      )}
    </motion.button>
  );
};

const AvatarOption = ({ id, src, selected, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(id)}
      className={`relative w-full max-w-[280px] mx-auto aspect-square rounded-xl cursor-pointer 
        overflow-hidden transition-all duration-200
        ${selected ? 'ring-4 ring-emerald-400 ring-offset-4' : 'hover:shadow-xl'}`}
    >
      <img
        src={src}
        alt={`Avatar ${id}`}
        className="w-full h-full object-cover rounded-xl"
      />
    </motion.div>
  );
};

const UpdateAvatar = () => {
  const [gender, setGender] = useState('Male');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const userId = localStorage.getItem('userId');
  const userDetails = localStorage.getItem('userDetails');
  const navigate = useNavigate()

  const handleUpdateAvatar = async () => {
    if (!selectedAvatar) {
      alert('Please select an avatar');
      return;
    }

    setIsLoading(true);
    const token = await getToken();
    const formData = new FormData();
    formData.append('UserID', userId);
    formData.append('AvatarID', selectedAvatar);

    try {
      await fetch(`${BaseURL}/update_avatar_id`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const res = await fetch(`${BaseURL}/get_avatar/${selectedAvatar}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const avatarData = await res.json();
      console.log(avatarData)
      let existingData = JSON.parse(localStorage.getItem("userDetails"));

      // Update specific fields
      existingData.AvatarID = avatarData.AvatarID
      existingData.avatarUrl = `${IMAGE_BASE_URL}${avatarData.AvatarURL}`

      // Save the updated data back to localStorage
      localStorage.setItem("userDetails", JSON.stringify(existingData));

      console.log("Updated data:", existingData)



      alert("Avatar Updated Successfully");
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update avatar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <CustomHeader title="Update Avatar" goBack={() => { navigate(-1) }} />

      {/* Main Content */}
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-8">
            {/* Logo */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
              <img
                src={logo}
                alt="Logo"
                className="w-48 h-16 object-contain"
              />
            </div>

            {/* Avatar Selection */}
            <div className="w-full pt-32">
              {gender === 'Male' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  <AvatarOption
                    id={1}
                    src={male1}
                    selected={selectedAvatar === 1}
                    onClick={setSelectedAvatar}
                  />
                  <AvatarOption
                    id={2}
                    src={male2}
                    selected={selectedAvatar === 2}
                    onClick={setSelectedAvatar}
                  />
                </div>
              )}

              {gender === 'Female' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  <AvatarOption
                    id={3}
                    src="/api/placeholder/280/280"
                    selected={selectedAvatar === 3}
                    onClick={setSelectedAvatar}
                  />
                  <AvatarOption
                    id={4}
                    src="/api/placeholder/280/280"
                    selected={selectedAvatar === 4}
                    onClick={setSelectedAvatar}
                  />
                </div>
              )}

              {(gender === 'Transgender' || gender === 'Prefer not to say') && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Male Avatars</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                      <AvatarOption
                        id={1}
                        src="/api/placeholder/280/280"
                        selected={selectedAvatar === 1}
                        onClick={setSelectedAvatar}
                      />
                      <AvatarOption
                        id={2}
                        src="/api/placeholder/280/280"
                        selected={selectedAvatar === 2}
                        onClick={setSelectedAvatar}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Female Avatars</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                      <AvatarOption
                        id={3}
                        src="/api/placeholder/280/280"
                        selected={selectedAvatar === 3}
                        onClick={setSelectedAvatar}
                      />
                      <AvatarOption
                        id={4}
                        src="/api/placeholder/280/280"
                        selected={selectedAvatar === 4}
                        onClick={setSelectedAvatar}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Update Button */}
            <div className="w-full max-w-md px-4 mt-8">
              <CustomButton
                onClick={handleUpdateAvatar}
                title="Update Avatar"
                loading={isLoading}
                className="mt-8"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UpdateAvatar;