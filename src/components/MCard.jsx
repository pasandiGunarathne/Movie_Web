import React from 'react'

const MCard = ({ movie }) => {
  if (!movie) return null;
  const { title, vote_average, poster_path, release_date, original_language } = movie;
  return (
    <div className='movie-card'>
        <img
          src={poster_path?
            `https://image.tmdb.org/t/p/w500/${poster_path}`:'/No-Poster.svg'}
          alt={title}
          />

          <div className='mt-4'>
            <h3 className="text-white">{title}</h3>

            <div className='content' style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap'}}>
              <div className='rating' style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                <img src="star.svg" alt="Star Icon" />
                <p className="text-white">{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
              </div>
              <span>•</span>
              <p className="lang" style={{margin: 0, color: '#fff'}}>
                Language: {original_language ? original_language.toUpperCase() : 'N/A'}
              </p>
              <span>•</span>
              <p className='year' style={{margin: 0, color: '#fff'}}>
                Year: {release_date ? release_date.split('-')[0] : 'N/A'}
              </p>
            </div>
          </div>
    </div>
  )
}


export default MCard