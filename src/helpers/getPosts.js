const returnPosts = async (value) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/assets/blogs/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: value }),
      }
    );
    const result = await res.json();
    //console.log(result)
    if (!result?.status) {
      console.log(result);
    }
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default returnPosts;
