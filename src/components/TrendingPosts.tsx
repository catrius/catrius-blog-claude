import { Link } from 'react-router';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import type { Tables } from '@/types/database';
import { useGetTrendingPostsQuery } from '@/store/api';

type Post = Tables<'post'>;

function TrendingCard({ post, rank }: { post: Post; rank: number }) {
  return (
    <div className="group relative">
      <Link to={`/posts/${post.slug}`} className="block no-underline">
        <div
          className="
            relative aspect-4/3 overflow-hidden rounded-lg bg-gray-100
            dark:bg-slate-800
          "
        >
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt=""
              className="
                size-full object-cover transition-transform duration-300
                group-hover:scale-105
              "
            />
          ) : (
            <div
              className="
                flex size-full items-center justify-center bg-linear-to-br
                from-blue-50 to-blue-100
                dark:from-slate-700 dark:to-slate-800
              "
            >
              <span
                className="
                  font-heading text-3xl font-bold text-blue-200
                  dark:text-slate-600
                "
              >
                {post.title.charAt(0)}
              </span>
            </div>
          )}
          {/* Gradient overlay */}
          <div
            className="
              absolute inset-0 bg-linear-to-t from-black/70 via-black/20
              to-transparent
            "
          />
          {/* Rank badge */}
          <span
            className="
              absolute top-2 left-2 flex size-6 items-center justify-center
              rounded-full bg-white/90 text-xs font-bold text-gray-900
              dark:bg-slate-900/90 dark:text-slate-100
            "
          >
            {rank}
          </span>
          {/* Text overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3
              className="
                line-clamp-2 font-heading text-sm font-semibold text-white
              "
            >
              {post.title}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
              <span>{post.view_count} views</span>
              {post.reading_time_minutes != null && (
                <>
                  <span>&middot;</span>
                  <span>{post.reading_time_minutes} min</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function TrendingPosts() {
  const { data: posts, isLoading } = useGetTrendingPostsQuery(5);

  if (isLoading || !posts || posts.length === 0) return null;

  const heading = (
    <h2
      className="
        mb-4 flex items-center gap-2 font-heading text-lg font-bold
        text-gray-900
        dark:text-slate-100
      "
    >
      <svg
        className="size-5 text-orange-500"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
          clipRule="evenodd"
        />
      </svg>
      Trending
    </h2>
  );

  return (
    <section className="mb-8">
      {heading}

      {/* Mobile: horizontal swiper */}
      <div className="md:hidden">
        <Swiper
          modules={[FreeMode]}
          freeMode
          slidesPerView="auto"
          spaceBetween={12}
          className="overflow-hidden!"
        >
          {posts.map((post, i) => (
            <SwiperSlide key={post.id} className="w-40!">
              <TrendingCard post={post} rank={i + 1} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop: grid */}
      <ul
        className="
          hidden grid-cols-5 gap-3
          md:grid
        "
      >
        {posts.map((post, i) => (
          <li key={post.id}>
            <TrendingCard post={post} rank={i + 1} />
          </li>
        ))}
      </ul>
    </section>
  );
}
