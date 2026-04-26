package com.dev.cinemasystem.mapper;




import com.dev.cinemasystem.entity.ShowTime;
import com.dev.cinemasystem.dto.showTimeDTO.*;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {RoomMapper.class, MovieMapper.class})
public interface ShowTimeMapper {

    @Mapping(target = "roomId", source = "room.roomId")
    @Mapping(target = "movieId", source = "movie.movieId")
    ShowTimeResponse toShowTimeResponse(ShowTime showTime);


    @Mapping(target = "room.roomId", source = "roomId")
    @Mapping(target = "movie.movieId", source = "movieId")
    @Mapping(target = "showTimeId", ignore = true)
    ShowTime toShowTimeFromShowTimeCreationRequest(ShowTimeCreationResquest request);


    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "showTimeId", ignore = true)
    @Mapping(target = "movie", ignore = true)
    @Mapping(target = "room", ignore = true)
    void updateShowTimeInfo(@MappingTarget ShowTime showTime, ShowTimeUpdateResquest request);

}
