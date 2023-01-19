class Vector3
{
    addVectors(v1, v2)
{
    return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z)
}

function subtractVectors(v1, v2)
{
    return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z)
}

function normalize(v)
{
    let len = length(v)
    return new Vector3(v.x/len, v.y/len, v.z/len)
}

length(v)
{
    return Math.sqrt((v.x * v.x)+(v.y * v.y)+(v.z * v.z))
}

}