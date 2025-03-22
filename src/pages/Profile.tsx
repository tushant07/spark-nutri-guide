
import React from 'react';
import Header from '@/components/Header';
import ProfileForm from '@/components/ProfileForm';
import NavigationBar from '@/components/NavigationBar';

const Profile = () => {
  return (
    <div className="min-h-screen gradient-background pb-20">
      <Header />
      
      <main className="px-6 py-4 max-w-md mx-auto">
        <div className="mb-6 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            Create your profile
          </h2>
          <p className="text-gray-600">
            We'll use this information to personalize your nutrition plan
          </p>
        </div>
        
        <ProfileForm />
      </main>
      
      <NavigationBar />
    </div>
  );
};

export default Profile;
