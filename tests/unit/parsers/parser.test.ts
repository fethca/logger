import { inflateSync } from 'node:zlib'
import { Parser } from '../../../src/parsers/parser.js'

const inflate = (compressed: unknown) => inflateSync(Buffer.from(compressed as string, 'base64')).toString()

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
    expect(inflate(new Parser().parse(str))).toBe(str)
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
    expect(inflate(new Parser().parse(obj))).toBe(JSON.stringify(obj))
  })
})
