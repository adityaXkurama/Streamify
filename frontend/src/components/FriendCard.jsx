import React from 'react'
import { Link } from 'react-router';
import {LANGUAGE_TO_FLAG} from '../constants/index'

const FriendCard = ({friend}) => {
  return (
    <div className='card bg-base-200 hover:shadow-md transition-shadow'>
      <div className="card-body p-4">
        <div className="flex items-center mb-3 gap-3">
          <div className="avatar size-12">
            <img src={friend.profilePic} alt={friend.fullName} />
          </div>
          <h3 className='font-semibold truncate'>{friend.fullName}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3 ">
          <span className='badge badge-secondary text-xs'>
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className='badge badge-secondary text-xs'>
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        <Link to={`/chat/${friend._id}`} className='btn btn-outline w-full'>
        Message</Link>

      </div>
    </div>
  )
}

export default FriendCard

export function getLanguageFlag(language){
  if(!language) return null;

  const lowLang = language.toLowerCase()
  const countryCode = LANGUAGE_TO_FLAG[lowLang]

  if(countryCode){
    return(
    <img src={`https://flagcdn.com/24x18/${countryCode}.png`} 
     alt={`${lowLang} flag`}
    className='h-3 mr-1 inline-block'
    />

    )
  }
  return null

}