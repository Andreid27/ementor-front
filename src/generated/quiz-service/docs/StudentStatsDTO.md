# StudentStatsDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**questions** | [**StudentQuestionsDTO**](StudentQuestionsDTO.md) |  | [optional] [default to undefined]
**quizzes** | [**StudentQuizzesDTO**](StudentQuizzesDTO.md) |  | [optional] [default to undefined]
**lastMonthQuizzesResults** | [**Array&lt;StudentQuizResultDTO&gt;**](StudentQuizResultDTO.md) |  | [optional] [default to undefined]
**lastMonthQuizTime** | **number** |  | [optional] [default to undefined]
**lastMonthQuestionsCount** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { StudentStatsDTO } from 'ementor-api-client';

const instance: StudentStatsDTO = {
    questions,
    quizzes,
    lastMonthQuizzesResults,
    lastMonthQuizTime,
    lastMonthQuestionsCount,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
