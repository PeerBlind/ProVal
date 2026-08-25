import { Linkedin, Mail, MapPin } from "lucide-react"

/**
 * c'est le footer de la page 
 * @returns 
 */
function Footer(){

  return(
    <footer>
    <div className=" flex justify-center p-Auto text-white
    bg-linear-to-r from-blue-950 via-green-800 to-blue-950 to-90% ...
    " >
      <div className="flex flex-col gap-6 justify-center">
          <div className=" w-full pt-5 pb-0 justify-center">
                  Contact  Us 
            </div>
            <div className=" w-full  pb-10 pt-0 justify-center ">
              <button className="btn btn-circle  mt-1 p-0 bg-white text-black border-[#e5e5e5]">
                 <Mail />
              </button>
              <button className="btn btn-circle mt-1 bg-white text-black border-[#e5e5e5]">
                <Linkedin color="#0d0d0d" />
              </button>
              <button className="btn btn-circle mt-1 bg-white text-black border-[#e5e5e5]">
                <MapPin />
              </button>
            </div>
            
      </div>
    </div>
    <div className="h-auto bg-white" >
        <a className="text-xl gap-2 text-white" href="../">
        </a>
      </div>

    </footer>
  )
}
export default Footer