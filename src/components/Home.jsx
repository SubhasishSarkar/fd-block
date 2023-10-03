import * as React from "react";
import { Card as Card1 } from "flowbite-react";
import HeroSectionImg from "./SvgCommunityGroup";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
export default function Home() {
  return (
    <>
      <div className="container flex justify-center align-center content-center mt-10 mb-10 pb-10">
        <HeroSectionImg />
        <div className="flex min-w-[50%] justify-center flex-col text-5xl 2xl:text-6xl text-right font-semibold">
          <span>Welcome to FD Block,</span>
          <span>Salt Lake City!</span>
        </div>
      </div>
      <div className="container flex flex-row justify-between gap-4">
        <Card sx={{ maxWidth: 345 }}>
          <CardActionArea>
            <CardMedia
              component="img"
              height="140"
              image="assets/images/post1.jpg"
              alt="green iguana"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Durga Pujo 2022
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Here is how one of the biggest pandals in Salt Lake was arranged
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card sx={{ maxWidth: 345 }}>
          <CardActionArea>
            <CardMedia
              component="img"
              height="140"
              image="assets/images/post2.jpg"
              alt="green iguana"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Durga Pujo 2021
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Here is how one of the biggest pandals in Salt Lake was arranged
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </div>
    </>
  );
}
