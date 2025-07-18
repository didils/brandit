/**
 * Open Graph Image Generator API
 *
 * This module dynamically generates Open Graph (OG) images for blog posts
 * based on their frontmatter metadata. These images are used when blog posts
 * are shared on social media platforms to provide rich, visual previews.
 *
 * The generator:
 * - Extracts the blog post slug from the request URL
 * - Loads and parses the corresponding MDX file to get frontmatter metadata
 * - Creates a visually appealing image with the blog post title and description
 * - Uses the blog post's featured image as a background
 * - Returns the generated image with appropriate dimensions for social sharing
 *
 * This enhances social sharing of blog content by providing consistent,
 * branded preview images across platforms like Twitter, Facebook, and LinkedIn.
 */
/**
 * Open Graph 이미지 생성 API
 *
 * 이 모듈은 블로그 게시글의 frontmatter 메타데이터를 기반으로
 * Open Graph (OG) 이미지를 동적으로 생성합니다.
 * 생성된 이미지는 블로그 글이 소셜 미디어 플랫폼에 공유될 때
 * 풍부하고 시각적인 미리보기를 제공하는 데 사용됩니다.
 *
 * 이 생성기는 다음과 같은 과정을 따릅니다:
 * - 요청 URL로부터 블로그 게시글의 slug를 추출
 * - 해당하는 MDX 파일을 로드하고 파싱하여 frontmatter 메타데이터를 가져옴
 * - 게시글의 제목과 설명을 사용하여 시각적으로 매력적인 이미지를 생성
 * - 게시글의 대표 이미지를 배경으로 사용
 * - 소셜 미디어 공유에 적합한 크기의 이미지를 반환
 *
 * 이를 통해 Twitter, Facebook, LinkedIn과 같은 플랫폼에서
 * 블로그 콘텐츠 공유 시 일관되고 브랜드화된 미리보기 이미지를 제공하여
 * 콘텐츠 공유 효과를 높입니다.
 */
import type { Route } from "./+types/og";

import { ImageResponse } from "@vercel/og";
import { bundleMDX } from "mdx-bundler";
import path from "node:path";
import { data } from "react-router";
import { z } from "zod";

/**
 * Validation schema for OG image request parameters
 *
 * This schema ensures that the request includes a valid blog post slug parameter.
 * It's used with Zod's safeParse method to validate the URL search parameters
 * before attempting to generate an image.
 */

const paramsSchema = z.object({
  slug: z.string(),
});

/**
 * Loader function for generating Open Graph images
 *
 * This function handles requests for dynamically generated OG images for blog posts.
 * It follows these steps:
 * 1. Extracts and validates the blog post slug from the request URL
 * 2. Constructs the file path to the corresponding MDX file
 * 3. Loads and parses the MDX file to extract frontmatter metadata
 * 4. Generates a visually appealing image using the post's title, description, and featured image
 * 5. Returns the image with dimensions optimized for social media platforms
 *
 * Error handling:
 * - Returns 400 Bad Request for invalid parameters
 * - Returns 404 Not Found if the MDX file doesn't exist
 * - Returns 500 Internal Server Error for other errors
 *
 * @param request - The incoming HTTP request with query parameters
 * @returns An ImageResponse containing the generated OG image
 */
export async function loader({ request }: Route.LoaderArgs) {
  // Extract and parse URL search parameters
  const url = new URL(request.url);
  const {
    success,
    data: params,
    error,
  } = paramsSchema.safeParse(Object.fromEntries(url.searchParams));

  // Return 400 Bad Request if parameters are invalid
  if (!success) {
    return data(null, { status: 400 });
  }

  // Construct the file path to the MDX file
  const filePath = path.join(
    process.cwd(),
    "app",
    "features",
    "blog",
    "docs",
    `${params.slug}.mdx`,
  );

  try {
    // Load and parse the MDX file to extract frontmatter
    const { frontmatter } = await bundleMDX({
      file: filePath,
    });

    // Generate and return the OG image using Vercel's ImageResponse
    return new ImageResponse(
      (
        <div tw="relative flex h-full w-full " style={{ fontFamily: "Inter" }}>
          {/* Background image from the blog post */}
          <img
            src={`${process.env.SITE_URL}/blog/${params.slug}.jpg`}
            tw="absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* Overlay with title and description */}
          <div tw="absolute flex h-full w-full items-center justify-center p-8 flex-col bg-black bg-opacity-20">
            <h1 tw="text-white text-6xl font-extrabold ">
              {frontmatter.title}
            </h1>
            <p tw="text-white text-3xl -mt-2">{frontmatter.description}</p>
          </div>
        </div>
      ),
      {
        // Dimensions optimized for social media platforms
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    // Handle file not found errors with a 404 response
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw data(null, { status: 404 });
    }
    // Handle other errors with a 500 response
    throw data(null, { status: 500 });
  }
}
