import {useEffect} from "react"
import Card from "../components/Card"

const Photos = () => {
  useEffect(() => {

  }, [])

  return <section class="bg-white dark:bg-gray-900">
    <div class="container px-6 py-10 mx-auto">
      <div class="grid grid-cols-1 gap-8 mt-8 xl:mt-12 xl:gap-12 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3">
        <Card
          imageUrl='https://dx75tjw7fhvsu.cloudfront.net/uploads/bd013adc-82fe-49eb-934c-132fbe1dcbea.png'
          title="hello world"
          description="Lorem hic aliquid exercitationem recusandae."
          filetype='image/png'
        />
    </div>
  </div>
</section>
}
export default Photos
