import React, { useState } from 'react'
import useAuthUser from '../hooks/useAuthUser.js'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { completeOnboarding } from '../lib/api.js'
import { CameraIcon, GlobeIcon, LoaderIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon } from 'lucide-react'
import { LANGUAGES } from '../constants/index.js'


const OnBoardingPage = () => {
  const {authUser}= useAuthUser()
  const queryClient = useQueryClient()

  const [formState,setFormState]= useState({
    fullName:authUser?.fullName || "",
    bio:authUser?.bio || "",
    nativeLanguage:authUser?.nativeLanguage || "",
    learningLanguage:authUser?.learningLanguage || "",
    location:authUser?.location || "",
    profilePic:authUser?.profilePic || "",
  })

  const {mutate:onboardingMutation,isPending}=useMutation({
    mutationFn: completeOnboarding,
    onSuccess:()=>{
      toast.success("Onboarding completed successfully!");
      queryClient.invalidateQueries({queryKey:["authUser"]})
    },
    onError:(error)=>{
      // console.log(error)
      toast.error(error.response.data.message)
    }
  })

  const handleSubmit = (e)=>{
    e.preventDefault();
    onboardingMutation(formState)
  }

  const handleRandomAvatar =()=>{
    const idx = Math.floor(Math.random()*100)+1
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`
    setFormState((prev)=>({...prev,profilePic:randomAvatar}))
    toast.success("Avatar Changed Successfully!!")
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 ">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8 ">
          <h1 className='text-2xl sm:text-3xl font-bold text-center'>Complete Your Profile</h1>

          <form onSubmit={handleSubmit} className='space-y-2'>

            <div className="flex flex-col items-center justify-center space-y-2 ">
              {/* AVATAR */}
              <div className="size-28 rounded-full bg-base-100 overflow-hidden">
                {formState.profilePic ? (
                  <img src={formState.profilePic} alt="" />
                ):(
                  <div className='flex h-full w-full items-center justify-center text-primary/50'>
                    <CameraIcon className='size-10 opacity-40'/>
                  </div>
                )}
              </div>
                {/* AVATAR CHANGE BUTTON */}
              <div className='flex items-center'>
                <button type='button' className='btn btn-accent' onClick={handleRandomAvatar}>
                  <ShuffleIcon className='size-4 mr-2'/>
                  Genarate Random Avatar</button>
              </div>
            </div>

            
                {/* FULL NAME` */}
              <div className="form-control ">
                <label className='label'>
                  <span className='label-text'>Full Name</span>
                </label>
                <input 
                type="text" 
                name='fullName'
                placeholder="Enter your name"
                onChange={(e)=>setFormState((prev)=>({...prev,fullName:e.target.value}))}
                className='input h-10 input-bordered  w-full'
                value={formState.fullName}
                />
              </div>

              {/* BIO */}
              <div className="form-control ">
                <label className='label'>
                  <span className='label-text'>Bio</span>
                </label>
                <textarea 
                type="text" 
                name='bio'
                placeholder="Tell others about yourself and your language learning goals"
                onChange={(e)=>setFormState((prev)=>({...prev,bio:e.target.value}))}
                className='input  input-bordered  w-full'
                value={formState.bio}
                />
              </div>

              {/* LANGUAGES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NATIVE LANGUAGE */}
                <div className="form-control">
                  <label className='label'>
                    <span className=''>Native Language</span>
                  </label>
                  <select name="nativeLanguage" 
                  value={formState.nativeLanguage}
                  onChange={(e)=>setFormState((prev)=>({...prev,nativeLanguage:e.target.value}))}
                  className='select select-bordered w-full'
                  >
                    <option value="">Select your native language</option>
                    {
                    LANGUAGES.map((lang)=>(
                      <option key={`native-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))
                    }
                  </select>
                </div>

                {/* LEARNING LANGUAGE */}
                <div className="form-control">
                  <label className='label'>
                    <span className=''>Learning Language</span>
                  </label>
                  <select name="learningLanguage" 
                  value={formState.learningLanguage}
                  onChange={(e)=>setFormState((prev)=>({...prev,learningLanguage:e.target.value}))}
                  className='select select-bordered w-full'
                  >
                    <option value="">Select language you're learning</option>
                    {
                    LANGUAGES.map((lang)=>(
                      <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))
                    }
                  </select>
                </div>

              </div>

              <div className='form-control'>
                <label className='label'>
                  <span className="label-text">
                    Location
                  </span>
                </label>
                <div className="relative">
                  <MapPinIcon className='absolute top-1/2 -translate-y-1/2 left-3 size-5 opacity-70'/>
                  <input 
                  type="text" 
                  name='location'
                  className='input input-bordered w-full pl-10'
                  placeholder='City, Country'
                  value={formState.location}
                  onChange={(e)=>setFormState((prev)=>({...prev,location:e.target.value}))}
                  />
                </div>
              </div>

              <button className='btn btn-primary w-full rounded-full' disabled={isPending} type='submit'>
                {
                  !isPending? (
                    <>
                    <ShipWheelIcon  className='size-5'/>
                    Complete Onboarding
                    </>
                  ):(
                    <>
                    <LoaderIcon  className='size-5 animate-spin'/>
                    Onboarding...
                    </>
                  )
                }
              </button>
                
          </form>
        </div>
      </div>
    </div>
  )
}

export default OnBoardingPage