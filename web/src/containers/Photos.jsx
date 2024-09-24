import {useEffect, useState} from "react"
import Card from "../components/Card"
import axios from "axios"
import {API_BASE_URL} from "../constants"

export default function Photos({ refreshState }) {
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/images`)
      .then((res) => {
        return res.data.Items
      }).then((images) => {
        setPhotos(images)
      })
  }, [refreshState])

  const [photos, setPhotos] = useState([])

  return <section className="bg-white dark:bg-gray-900">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 gap-8 mt-8 xl:mt-12 xl:gap-12 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3">
        {photos.map((photo) => (
          <Card
            key={photo.PhotoID}
            imageUrl={photo.url}
            title={photo.title}
            description={photo.description}
            filetype={photo.contentType}
          />
        ))}
    </div>
  </div>
</section>
}
