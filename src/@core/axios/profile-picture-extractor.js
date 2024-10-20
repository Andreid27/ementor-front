import * as apiSpec from '../../apiSpec'

const extractProfilePicture = user => {
  if (user.attributes && user.attributes.pictureId && user.attributes.pictureId.length > 0) {
    return {
      type: "API",
      url: `https://api.e-mentor.ro${apiSpec.THUMBNAIL_CONTROLLER}/download/${user.attributes.pictureId[0]}`,
      userId: user.id
    }
  }
  else if (user.attributes && user.attributes.picture && user.attributes.picture.length > 0) {
    return {
      type: "EXTERNAL",
      url: user.attributes.picture[0],
      userId: user.id
    }
  } else {
    return {
      type: "NONE",
      userId: user.id
    }
  }
}

export default extractProfilePicture;
