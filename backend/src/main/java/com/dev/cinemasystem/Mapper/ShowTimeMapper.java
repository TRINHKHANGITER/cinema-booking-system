package com.dev.cinemasystem.Mapper;




import com.dev.cinemasystem.Entity.ShowTime;
import com.dev.cinemasystem.dto.showTimeDTO.*;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ShowTimeMapper {

    @Mapping(target = "roomId", source = "room.roomId")
    @Mapping(target = "movieId", source = "movie.movieId")
    ShowTimeResponse toShowTimeResponse(ShowTime showTime);


    @Mapping(target = "room.roomId", source = "roomId")
    @Mapping(target = "movie.movieId", source = "movieId")
    ShowTime toShowTimeFromShowTimeCreationRequest(ShowTimeCreationResquest request);


    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateShowTimeInfo(@MappingTarget ShowTime showTime, ShowTimeUpdateResquest request);

}
