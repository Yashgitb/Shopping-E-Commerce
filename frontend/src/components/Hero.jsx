import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <div className="flex flex-col sm:flex-row border border-gray-400">
      <div className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0">
        <div className="text-[#414141]">
          <div className="flex items-center gap-2">
            <p className="w-8 md:w-11 h-[2px] bg-[#414141]" />
            <p className="font-medium text-sm md:text-base">OUR BESTSELLERS</p>
          </div>
          <h1 className="font-prata text-3xl sm:py-3 lg:text-5xl leading-relaxed">Latest Arrivals</h1>
          <Link to="/collection" className="flex items-center gap-2">
            <p className="font-semibold text-sm md:text-base">SHOP NOW</p>
            <p className="w-8 md:w-11 h-[1px] bg-[#414141]" />
          </Link>
        </div>
      </div>
      <img className="w-full sm:w-1/2" src={assets.hero_img} alt="Latest arrivals" />
    </div>
  )
}

export default Hero
