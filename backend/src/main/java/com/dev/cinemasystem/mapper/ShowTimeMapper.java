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
    @Mapping(target = "releaseDate", expression = "java(request.getStartTime() != null ? request.getStartTime().toLocalDate() : null)")
    @Mapping(target = "startTime", expression = "java(request.getStartTime() != null ? request.getStartTime().toLocalTime() : null)")
    @Mapping(target = "endTime", expression = "java(request.getEndTime() != null ? request.getEndTime().toLocalTime() : null)")
    @Mapping(target = "showTimeId", ignore = true)
    @Mapping(target = "status", ignore = true)
    ShowTime toShowTimeFromShowTimeCreationRequest(ShowTimeCreationResquest request);


    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "releaseDate", expression = "java(request.getStartTime() != null ? request.getStartTime().toLocalDate() : showTime.getReleaseDate())")
    @Mapping(target = "startTime", expression = "java(request.getStartTime() != null ? request.getStartTime().toLocalTime() : showTime.getStartTime())")
    @Mapping(target = "endTime", expression = "java(request.getEndTime() != null ? request.getEndTime().toLocalTime() : showTime.getEndTime())")
    @Mapping(target = "showTimeId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "movie", ignore = true)
    @Mapping(target = "room", ignore = true)
    void updateShowTimeInfo(@MappingTarget ShowTime showTime, ShowTimeUpdateResquest request);

}
