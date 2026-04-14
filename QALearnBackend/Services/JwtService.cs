using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace QALearnAPI.Services;

public class JwtService(IConfiguration cfg)
{
    public string GenerateToken(Guid userId, string role)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(cfg["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer:   cfg["Jwt:Issuer"],
            audience: cfg["Jwt:Audience"],
            claims:   [new Claim("id", userId.ToString()), new Claim("role", role)],
            expires:  DateTime.UtcNow.AddDays(int.Parse(cfg["Jwt:ExpiresInDays"]!)),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
