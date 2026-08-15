type Greeting = { name: string }

const Sample = ({ name }: Greeting): string => `ola ${name}`

module.exports = Sample
