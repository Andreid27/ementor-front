# SubmitQuizDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**quizStudentId** | **string** |  | [optional] [default to undefined]
**submitedQuestionAnswers** | [**Array&lt;SubmitedQuestionAnswer&gt;**](SubmitedQuestionAnswer.md) |  | [optional] [default to undefined]
**quiz** | [**QuizDTO**](QuizDTO.md) |  | [optional] [default to undefined]
**correctAnswers** | [**Array&lt;SubmitedQuestionAnswer&gt;**](SubmitedQuestionAnswer.md) |  | [optional] [default to undefined]
**startedAt** | **string** |  | [optional] [default to undefined]
**enddedAt** | **string** |  | [optional] [default to undefined]
**correctCount** | **number** |  | [optional] [default to undefined]
**studentId** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { SubmitQuizDTO } from 'ementor-api-client';

const instance: SubmitQuizDTO = {
    quizStudentId,
    submitedQuestionAnswers,
    quiz,
    correctAnswers,
    startedAt,
    enddedAt,
    correctCount,
    studentId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
