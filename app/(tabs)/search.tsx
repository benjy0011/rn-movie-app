import MovieCard from "@/components/MovieCard"
import SearchBar from "@/components/SearchBar"
import { icons } from "@/constants/icons"
import { images } from "@/constants/images"
import { fetchMovies } from "@/services/api"
import { updateSearchCount } from "@/services/appwrite"
import { useFetch } from "@/services/useFetch"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native'
const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const { 
    data: movies,
    loading: moviesLoading,
    error: moviesError,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({ 
    query: searchQuery
  }))
  const firstLoad = useRef<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setDebouncedSearchQuery(searchQuery);
      
      if (searchQuery.trim()) {
        await loadMovies();
      } else {
        if (firstLoad.current) reset();
        else firstLoad.current = true;
      }
    }, 500)

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  useEffect(() => {
    if (movies && movies.length > 0 && !moviesLoading && debouncedSearchQuery.trim()) {
      updateSearchCount(debouncedSearchQuery.trim(), movies[0])
        .catch(err => console.error("Failed to update search count:", err));
    }
  }, [movies, moviesLoading, debouncedSearchQuery]);

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="flex-1 absolute w-full z-0" resizeMode="cover" />

      <FlatList
        data={movies}
        renderItem={({ item }) => <MovieCard {...item} />}
        keyExtractor={( item ) => item.id.toString() }
        className="px-5"
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "center",
          gap: 16,
          marginVertical: 16
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>

            <View className="my-5">
              <SearchBar
                placeholder="Search movies ..."
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />
            </View>

            {moviesError && (
              <Text className="text-red-500 px-5 my-3">
                Error: {moviesError.message}
              </Text>
            )}

            {!moviesError && debouncedSearchQuery.trim() && (
              <Text className="text-white font-bold">
                Serach Result for:{' '}
                <Text className="text-accent">{debouncedSearchQuery}</Text>
              </Text>
            )}

            {moviesLoading && (
              <ActivityIndicator size="large" color="#0000ff" className="my-3" />
            )}
          </>
        }
        ListEmptyComponent={
          !moviesLoading && !moviesError ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim() ? 'No movies found' : 'Search for a movie'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}
export default Search