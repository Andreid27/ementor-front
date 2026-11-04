/**
 * Read-only checks on the e2e copy of the profile-service database.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { BACKEND_DIR, E2E_DATABASE, POSTGRES_CONTAINER } from './stack'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

const databaseUser = (): string => {
  const env = readFileSync(`${BACKEND_DIR}/profile-service/.env`, 'utf8')
  const user = env.match(/^DATABASE_USERNAME=(.*)$/m)?.[1]?.trim()
  if (!user) throw new Error('DATABASE_USERNAME missing from profile-service/.env')

  return user
}

const rows = (sql: string): Record<string, string>[] => {
  const out = execFileSync(
    'docker',
    ['exec', POSTGRES_CONTAINER, 'psql', '-U', databaseUser(), '-d', E2E_DATABASE, '-At', '-c', `select row_to_json(t) from (${sql}) t`],
    { encoding: 'utf8' }
  )

  return out
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line))
}

const uuid = (id: string): string => {
  if (!UUID.test(id)) throw new Error(`not a uuid: ${id}`)

  return id
}

export const studentProfile = (userId: string) =>
  rows(
    `select s.picture, s.picture_url, s.school, s.school_grade, s.school_domain, s.school_speciality, s.phone,
            a.city, a.street, a.number
       from student_profiles s left join addresses a on a.id = s.address_id
      where s.id = '${uuid(userId)}'`
  )[0] || null

export const professorProfile = (userId: string) =>
  rows(
    `select p.picture, p.full_name, p.invitation_code, p.about, a.city, a.street
       from professor_profile p left join addresses a on a.id = p.address_id
      where p.id = '${uuid(userId)}'`
  )[0] || null

export const bankAccounts = (professorId: string) =>
  rows(`select iban, bank_name, account_holder_name, swift_code from bank_accounts where professor_id = '${uuid(professorId)}'`)

export const relationship = (studentId: string, professorId: string) =>
  rows(
    `select status from student_professor_relationships
      where student_id = '${uuid(studentId)}' and professor_id = '${uuid(professorId)}'`
  )[0] || null
