import * as apiSpec from '../../apiSpec'

const extractProfilePicture = (user, fullDimension) => {
  const tempController = fullDimension ? apiSpec.PROFILE_IMAGE_CONTROLLER : apiSpec.THUMBNAIL_CONTROLLER // move this to controller
  const controller = "https://api.e-mentor.ro" + tempController;
  if (user.attributes) {
    if (user.attributes.pictureId && user.attributes.pictureId.length > 0) {
      return {
        type: "API",
        url: `${controller}/download/${user.attributes.pictureId[0]}`,
        userId: user.id
      }
    }
    else if (user.attributes.picture && user.attributes.picture.length > 0) {
      return {
        type: "EXTERNAL",
        url: fullDimension ? user.attributes.picture[0].replace('s96-c', 's300-c') : user.attributes.picture[0],
        userId: user.id
      }
    } else {
      return {
        type: "NONE",
        userId: user.id
      }
    }

  } else if (user.userId) { // aka user profile
    if (user.pictureId) {
      return {
        type: "API",
        url: `${controller}/download/${user.pictureId}`,
        userId: user.userId
      }
    } else if (user.user && user.user.picture) {
      return {
        type: "EXTERNAL",
        url: fullDimension ? user.user.picture.replace('s96-c', 's1000-c') : user.user.picture,
        userId: user.user.userId
      }
    } else {
      return {
        type: "NONE",
        userId: user.userId
      }
    }
  } else {
    return {
      type: "NONE",
      userId: user.id ? user.id : user.userId
    }
  }
}

export default extractProfilePicture;
