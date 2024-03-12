import { Parser } from '../../../src/parsers/parser.js'

describe('parse', () => {
  it('should return info as is for non string and non objects', () => {
    expect(new Parser().parse(5)).toBe(5)
  })

  it('should return non compressed string with less than 1000 characters', () => {
    expect(new Parser().parse('toto')).toBe('toto')
  })

  it('should return compressed string with more than 1000 characters', () => {
    const str =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ultricies purus et nulla tempus, egestas rhoncus diam efficitur. Maecenas mattis, est a laoreet volutpat, sapien nisi viverra ipsum, nec elementum augue velit sit amet elit. In ut tincidunt quam, quis sollicitudin dolor. Nulla eu viverra ligula. Curabitur id odio vel ex porta rhoncus eget eu dui. Duis et arcu ut nisl suscipit scelerisque eu id justo. Curabitur a enim consectetur, pellentesque dui sit amet, elementum dui. Integer sodales placerat ligula et laoreet. Vivamus at viverra nisi, sit amet fermentum diam. Etiam volutpat id nisl volutpat fermentum. Duis sit amet velit mattis turpis rhoncus viverra. Integer in nisi at ligula pretium vehicula nec a mi. Sed id malesuada leo, id rhoncus magna. Proin ex augue, dictum sed velit faucibus, tincidunt dictum diam. Nunc nec augue non velit efficitur blandit. Morbi consequat lacinia dui, sed tempus massa vestibulum quis. Proin scelerisque interdum diam sed faucibus. Sed volutpat.'
    expect(new Parser().parse(str)).toBe(
      'eJxNk01u3DAMha/CAxi+RNtFgCYIUKB7jsRxGOjHI5FGj1/Ssj2ztCzyfY+P+l0bZeC1a4ZYU23QWQAzyQShlk5BSLQBRl65By4LUGKZ4UNTQtAkjQNTh1WbdiCBsv8Qyqv2CWihLtihfdUS7EJkzED3uxVZ2xnekQIVu5BRhL2gmzwkNC5rttWksqLBdFyZChTuDBtv1BoO7AkKBYOiTEXMBeqiBJtTXl4O5rcCKiBcAkctAg9FK38od+g1pZ0pchmDOC2SXnqJF004ww9teHN+4Ag1cnU5oH+w1iZ4eTXv4uVReYafrmLf2II6hRlJ0NVGujpoMAON+8PQrcLafmuX+iplJIXzaygTrJSSuaa9zmRewnsOZJd/s1sLWbo1YvK4EgZqKIcnJztmPsNf3jAbv/09nfvYp+c479TO5pbnDL/EYz3Dcvzd3nVw3T/mcDUaMY3swSzZjl3jO7Sf7HzE/6ReGwkbxUZfHPzAVwEhm+E/FJ0ju1vFaOFRnfzkbJ9xKdb8s1Xra9ntezOZoeC+upUPuDtq4Jvv8nNxjkvD/IeWMIT3zSu1HJXXmsMtYYm+ge+13XhkaMvnM7cnxegZTbvmeDcG1ztamy4mnUzKl/SEfV0Wttm0eLDsHU7eMYIzgvk/hddu9A==',
    )
  })

  it('should stringify buffer', () => {
    expect(new Parser().parse(Buffer.from('abc'))).toBe('abc')
  })

  it('should stringify object', () => {
    expect(new Parser().parse({ prop: 'value' })).toBe('{"prop":"value"}')
  })

  it('should inspect circular object', () => {
    const obj: Record<string, unknown> = {}
    obj.circ = obj
    expect(new Parser().parse(obj)).toBe('<ref *1> { circ: [Circular *1] }')
  })

  it('should compress stringified object with more than 1000 characters', () => {
    const obj = {
      _id: {
        $oid: '65a9099a42e1b82ded2371ca',
      },
      id: 8466396,
      __v: 0,
      category: 'Film',
      createdAt: {
        $date: '2024-01-18T11:20:57.992Z',
      },
      dateRelease: '2022-03-04',
      dateReleaseOriginal: '2022-03-04',
      directors: [
        {
          name: 'Matt Reeves',
          person_id: 50404,
          _id: {
            $oid: '65d8e1a377f280c54b8fe599',
          },
        },
      ],
      duration: 10560,
      frenchReleaseDate: '2022-03-02',
      genresInfos: [
        {
          label: 'Action',
          _id: {
            $oid: '65d8e1a377f280c54b8fe59a',
          },
        },
        {
          label: 'Drame',
          _id: {
            $oid: '65d8e1a377f280c54b8fe59b',
          },
        },
        {
          label: 'Policier',
          _id: {
            $oid: '65d8e1a377f280c54b8fe59c',
          },
        },
        {
          label: 'Thriller',
          _id: {
            $oid: '65d8e1a377f280c54b8fe59d',
          },
        },
      ],
      medias: [
        'https://media.senscritique.com/media/000020568005/300/the_batman.png',
        'https://image.tmdb.org/t/p/original/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        'https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
      ],
      originalTitle: null,
      rating: 7,
      ratingCount: 33671,
      slug: 'the_batman',
      title: 'The Batman',
      tmdb: {
        title: 'The Batman',
        originalTitle: 'The Batman',
        originalLanguage: {
          id: 1,
          name: 'English',
        },
        sortTitle: 'batman',
        inCinemas: '2022-03-01T00:00:00Z',
        physicalRelease: '2022-05-24T00:00:00Z',
        digitalRelease: '2022-04-17T00:00:00Z',
        images: [
          'https://image.tmdb.org/t/p/original/74xTEgt7R36Fpooo50r9T25onhq.jpg',
          'https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
        ],
        year: 2022,
        studio: '6th & Idaho',
        cleanTitle: 'thebatman',
        tmdbId: 414906,
        genres: [
          {
            label: 'Crime',
            _id: {
              $oid: '65d8e1a377f280c54b8fe5a3',
            },
          },
          {
            label: 'Mystery',
            _id: {
              $oid: '65d8e1a377f280c54b8fe5a4',
            },
          },
          {
            label: 'Thriller',
            _id: {
              $oid: '65d8e1a377f280c54b8fe5a5',
            },
          },
        ],
        ratings: {
          imdb: {
            votes: 769863,
            value: 7.8,
          },
          tmdb: {
            votes: 9213,
            value: 7.687,
          },
          metacritic: {
            votes: 0,
            value: 72,
          },
          rottenTomatoes: {
            votes: 0,
            value: 85,
          },
        },
        popularity: 160.988,
      },
      updatedAt: {
        $date: '2024-02-23T18:19:15.178Z',
      },
      correctQuery: '',
      forceTmdb: 0,
      countries: ['États-Unis'],
      popularity: 19.773821424061488,
      search: 'the batman bat batm batma',
    }
    expect(new Parser().parse(obj)).toBe(
      'eJzNVd1u2zYUfhWDGHZlSyT1r7suaYBsK9qk6k2HIaAkWuIgkSpJuTUCP0Cfay+2Q8mOoyYDDOxmhgFJ5Hf+v3POI3oQNcof0U/KPVEcsQxnGQspJ2VKa17TICEVQ4c1coA0jOMgi9fo4WGHcrxGFbO8UXoPsjei6xGcaA5n9Rs7qa3hHe4opuEGkw1JC0JyivMo8bKMfnZ6HeSed5yZI5JucLDBIVpcvdeiEZJ1LyBC88oqbVD+xyOSrHdK3jFrV/ec77gByMC1UXIKNMIhDtcvgq5TTliQJFua4ioKy3TLoyxDh8OfYGDUzAolUU5wFEPIW81l1R7dun6Kb3aJgr2GS83Nrdyq2amOldz5/aaa9FxoHnJ+WJ+Fr7UL7ULZcin7QXWiElxfKl4txYtWi667XLyeE9fzWjCXAdRaO5jc96cTz3BpKi2s+DJyr1L9fOxj+FHIcIpx5AcY+7blDyWzPZPeIBswflIjetZwz/Z16Snd+NYffHVkh5+E34q3jU3ug/hmUEpFWGcFjZRsv3h/DZdqKfGH7uNNff213P+Gq210/+3r9cDe/3q3u5u0QHQnbCFsBwyQY9etkWMKuJonp9crNUpohCCIE7JGphvhEp0DA3fsLA9J5qtfng7BK5fnVy9/sPz65e9MNiME6LS4WoH1Y2+8lU0nTOs6zyhtT1qeHBLySkjeu8qdaU0KjPPp/9k1VLs3omLdj10bbWi4ANbgjH2JCzckWeCmWiyo8r+o8Z4zjXLnM+TKjrVQjvS2Xf28uq1Zq9y0g8jkKYdQ2PJ5CW8h8SEJMxyfhsJiHlxpcXFLs2DZk+/2xnIYuxdKh/+po1k0d/TMaTNx6sjQnbIuqiTO0jhYox3rRshE4qWHM4uPmIyS54g4TQ5uSFg2DYPqGRKfYRQwWlnLZaF6ZhU3r+LSCOJDgxrGjoE2WEckxl6WOjfGof63hUQ3NChImpMsJ5FHknRaSJXSbqfcjXzaa5CkrdIVL6Zw3M5zTa3FTNi/v1tmzeaTFMZRZuFC5iVJkFIS0hDHJExToBFQqmpnrqxmsrjH9Dp/o8M/YedW8w==',
    )
  })
})
