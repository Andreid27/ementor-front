# QuizWriteDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**title** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**componentType** | **string** |  | [optional] [default to undefined]
**difficultyLevel** | **number** |  | [optional] [default to undefined]
**maxTime** | **number** |  | [optional] [default to undefined]
**chaptersId** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**questionsList** | [**Array&lt;QuestionDTO&gt;**](QuestionDTO.md) |  | [optional] [default to undefined]

## Example

```typescript
import { QuizWriteDTO } from 'ementor-api-client';

const instance: QuizWriteDTO = {
    id,
    title,
    description,
    componentType,
    difficultyLevel,
    maxTime,
    chaptersId,
    questionsList,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
