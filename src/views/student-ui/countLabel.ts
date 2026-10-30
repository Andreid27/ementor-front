/**
 * "o lecție", "5 lecții", "20 de lecții": Romanian puts "de" before the noun for
 * 20 and up, unless the last two digits are 01–19. `one` carries its own article
 * ("o lecție", "un test").
 */
export const countLabel = (count: number, one: string, many: string) => {
  if (count === 1) return one

  const lastTwo = count % 100
  const needsDe = count >= 20 && (lastTwo === 0 || lastTwo >= 20)

  return `${count} ${needsDe ? 'de ' : ''}${many}`
}
