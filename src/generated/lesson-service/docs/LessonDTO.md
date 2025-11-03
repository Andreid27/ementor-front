# LessonDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**title** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**timeToRead** | **number** |  | [optional] [default to undefined]
**files** | [**Array&lt;HostFileDTO&gt;**](HostFileDTO.md) |  | [optional] [default to undefined]
**chapters** | [**Array&lt;ChapterDTO&gt;**](ChapterDTO.md) |  | [optional] [default to undefined]
**startAfter** | **string** |  | [optional] [default to undefined]
**lastRead** | **string** |  | [optional] [default to undefined]
**totalTime** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { LessonDTO } from 'ementor-api-client';

const instance: LessonDTO = {
    id,
    title,
    description,
    timeToRead,
    files,
    chapters,
    startAfter,
    lastRead,
    totalTime,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
