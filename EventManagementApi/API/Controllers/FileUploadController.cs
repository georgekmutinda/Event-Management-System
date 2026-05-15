using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;

namespace EventManagementApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/files")]
    public class FileUploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public FileUploadController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "A file is required for upload." });
            }

            var uploadsFolder = Path.Combine(_environment.ContentRootPath, "Uploads");
            Directory.CreateDirectory(uploadsFolder);

            var safeFileName = Path.GetFileName(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid():N}_{safeFileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            await using var fileStream = System.IO.File.Create(filePath);
            await file.CopyToAsync(fileStream);

            var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{Uri.EscapeDataString(uniqueFileName)}";
            return Ok(new { fileName = uniqueFileName, url = fileUrl });
        }
    }
}
