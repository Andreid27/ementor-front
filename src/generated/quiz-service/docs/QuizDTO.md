# QuizDTO


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
**chapters** | [**Array&lt;ChapterDTO&gt;**](ChapterDTO.md) |  | [optional] [default to undefined]
**questionsId** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**questions** | [**Array&lt;QuestionDTO&gt;**](QuestionDTO.md) |  | [optional] [default to undefined]
**endTime** | **string** |  | [optional] [default to undefined]
**createdBy** | **string** |  | [optional] [default to undefined]
**quizPreviousAttempts** | [**Array&lt;QuizStudent&gt;**](QuizStudent.md) |  | [optional] [default to undefined]
**remainedAttempts** | **number** |  | [optional] [default to undefined]
**correctAnswers** | [**Array&lt;SubmitedQuestionAnswer&gt;**](SubmitedQuestionAnswer.md) |  | [optional] [default to undefined]

## Example

```typescript
import { QuizDTO } from 'ementor-api-client';

const instance: QuizDTO = {
    id,
    title,
    description,
    componentType,
    difficultyLevel,
    maxTime,
    chaptersId,
    chapters,
    questionsId,
    questions,
    endTime,
    createdBy,
    quizPreviousAttempts,
    remainedAttempts,
    correctAnswers,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
